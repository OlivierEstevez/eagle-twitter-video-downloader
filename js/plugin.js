eagle.onPluginCreate(async (plugin) => {
	updateTheme();
	console.log('eagle.onPluginCreate');
	console.log(plugin);

	document.getElementById("twitterUrl").focus()

	document.getElementById("closeButton").addEventListener("click", () => {
		window.close()
	})

	document.getElementById('downloadForm').addEventListener('submit', async (e) => {
		e.preventDefault();
		await downloadAndImport();
});
});

eagle.onThemeChanged(() => {
	updateTheme();
});

async function updateTheme() {
	const THEME_SUPPORT = {
		AUTO: eagle.app.isDarkColors() ? 'gray' : 'light',
		LIGHT: 'light',
		LIGHTGRAY: 'lightgray',
		GRAY: 'gray',
		DARK: 'dark',
		BLUE: 'blue',
		PURPLE: 'purple',
	};

	const theme = eagle.app.theme.toUpperCase();
	const themeName = THEME_SUPPORT[theme] ?? 'dark';
	const htmlEl = document.querySelector('html');

	htmlEl.classList.add('no-transition');
	htmlEl.setAttribute('theme', themeName);
	htmlEl.setAttribute('platform', eagle.app.platform);
	htmlEl.classList.remove('no-transition');
}

const returnError = (message) => {
	const statusEl = document.getElementById('status');
	const urlInput = document.getElementById('twitterUrl');
	statusEl.textContent = message;
	statusEl.classList.add('error');
	urlInput.classList.add('error');
	urlInput.addEventListener('input', () => {
			statusEl.textContent = '';
			statusEl.classList.remove('error');
			urlInput.classList.remove('error');
			urlInput.removeEventListener('input', () => {});
	})
}

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

function downloadFile(url, destPath) {
	return new Promise((resolve, reject) => {
		const client = url.startsWith('https') ? https : http;
		client.get(url, (response) => {
			if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
				return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
			}
			const fileStream = fs.createWriteStream(destPath);
			response.pipe(fileStream);
			fileStream.on('finish', () => { fileStream.close(); resolve(); });
			fileStream.on('error', reject);
		}).on('error', reject);
	});
}

function buildFullPath() {
	const home = os.homedir();
	const extraPaths = [
		path.join(home, '.local', 'bin'),
		path.join(home, 'bin'),
		'/usr/local/bin',
		'/opt/homebrew/bin',
	];
	let basePath = process.env.PATH || '';
	try {
		const shell = process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash';
		basePath = execSync(`${shell} -l -c 'echo $PATH'`, { encoding: 'utf-8' }).trim();
	} catch (_) {}
	const allPaths = [...new Set([...extraPaths, ...basePath.split(':')])];
	return allPaths.join(':');
}

const FULL_PATH = buildFullPath();

function findFfmpeg() {
	try {
		return execSync('which ffmpeg', { encoding: 'utf-8', env: { ...process.env, PATH: FULL_PATH } }).trim();
	} catch (_) {}
	return null;
}

async function convertMp4ToGif(mp4Url) {
	const ffmpeg = findFfmpeg();
	console.log('FULL_PATH:', FULL_PATH);
	console.log('ffmpeg path:', ffmpeg);
	if (!ffmpeg) {
		console.error('ffmpeg not found');
		return null;
	}

	const tmpDir = os.tmpdir();
	const ts = Date.now();
	const mp4Path = path.join(tmpDir, `twitter_gif_${ts}.mp4`);
	const gifPath = path.join(tmpDir, `twitter_gif_${ts}.gif`);

	try {
		await downloadFile(mp4Url, mp4Path);
		console.log('mp4 downloaded, size:', fs.statSync(mp4Path).size);
		execSync(`"${ffmpeg}" -i "${mp4Path}" -vf "fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -y "${gifPath}"`, { env: { ...process.env, PATH: FULL_PATH } });
		console.log('gif converted, size:', fs.statSync(gifPath).size);
		return gifPath;
	} catch (e) {
		console.error('ffmpeg conversion failed:', e.message);
		try { fs.unlinkSync(gifPath); } catch (_) {}
		return null;
	} finally {
		try { fs.unlinkSync(mp4Path); } catch (_) {}
	}
}

function extractTweetId(url) {
	const match = url.match(/\/status\/(\d+)/);
	return match ? match[1] : null;
}

async function downloadViaSyndication(url, tweetId) {
	const apiUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`;
	const response = await fetch(apiUrl);
	if (!response.ok) return null;

	const data = await response.json();
	const tweetText = data.text?.replace(/https?:\/\/\S+/g, '').trim() || 'Twitter Media';
	const mediaItems = [];

	// Collect GIFs and videos from mediaDetails
	if (data.mediaDetails) {
		for (const media of data.mediaDetails) {
			if (media.type === 'animated_gif' || media.type === 'video') {
				const variants = media.video_info?.variants?.filter(v => v.content_type === 'video/mp4') || [];
				// Pick the highest bitrate variant
				const best = variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
				if (best) {
					mediaItems.push({
						url: best.url,
						type: media.type === 'animated_gif' ? 'gif' : 'video',
					});
				}
			}
		}
	}

	if (mediaItems.length === 0) return null;
	return { tweetText, mediaItems };
}

async function downloadViaTwitsave(url) {
	const apiUrl = `https://twitsave.com/info?url=${url}`;
	const response = await fetch(apiUrl);
	const text = await response.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, 'text/html');

	const videoContainers = doc.querySelectorAll('.origin-top-right');
	const tweetText = doc.querySelector('.leading-tight p.m-2')?.textContent || 'Twitter Video';

	if (videoContainers.length === 0) return null;

	const mediaItems = [];
	for (const container of videoContainers) {
		const qualityButtons = container.querySelectorAll('a');
		const videoUrl = qualityButtons[0]?.href;
		if (videoUrl) {
			mediaItems.push({ url: videoUrl, type: 'video' });
		}
	}

	if (mediaItems.length === 0) return null;
	return { tweetText, mediaItems };
}

async function downloadAndImport() {
	const statusEl = document.getElementById('status');
	const urlInput = document.getElementById('twitterUrl');
	const url = urlInput.value.trim();

	// Check if URL is specifically from Twitter/X
	const twitterRegex = /^https?:\/\/(www\.)?(twitter|x)\.com\/(\w+|i)\/status\/\d+/i;
	if (!url) {
		statusEl.textContent = 'Please enter a Twitter/X video URL';
		return;
	}

	if (!twitterRegex.test(url)) {
		returnError('Please enter a valid Twitter/X URL');
		return;
	}

	try {
			statusEl.textContent = 'Fetching media information...';

			const tweetId = extractTweetId(url);
			let result = null;

			// Try syndication API first (supports both videos and GIFs)
			if (tweetId) {
				result = await downloadViaSyndication(url, tweetId);
			}

			// Fallback to twitsave for videos
			if (!result) {
				result = await downloadViaTwitsave(url);
			}

			if (!result || result.mediaItems.length === 0) {
				returnError('No videos or GIFs found in the tweet.');
				return;
			}

			const { tweetText, mediaItems } = result;
			statusEl.textContent = `Found ${mediaItems.length} media item(s). Downloading...`;

			for (let i = 0; i < mediaItems.length; i++) {
					const media = mediaItems[i];
					const suffix = mediaItems.length > 1 ? `_${media.type}${i + 1}` : '';
					const itemName = `${tweetText}${suffix}`;

					if (media.type === 'gif') {
						statusEl.textContent = `Converting GIF ${i + 1} of ${mediaItems.length}...`;
						const gifPath = await convertMp4ToGif(media.url);
						if (gifPath) {
							await eagle.item.addFromPath(gifPath, {
								name: itemName,
								website: url,
								tags: ['twitter']
							});
							try { fs.unlinkSync(gifPath); } catch (_) {}
						} else {
							// Fallback to MP4 if ffmpeg is not available
							await eagle.item.addFromURL(media.url, {
								name: itemName,
								website: url,
								tags: ['twitter']
							});
						}
					} else {
						await eagle.item.addFromURL(media.url, {
							name: itemName,
							website: url,
							tags: ['twitter']
						});
					}

					statusEl.textContent = `Imported ${i + 1} of ${mediaItems.length}`;
			}

			statusEl.textContent = 'All media imported successfully!';
			urlInput.value = '';

	} catch (error) {
			statusEl.textContent = `Error: ${error.message}`;
			console.error('Error:', error);
	}
}