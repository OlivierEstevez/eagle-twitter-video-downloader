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

async function downloadAndImport() {
	const statusEl = document.getElementById('status');
	const urlInput = document.getElementById('twitterUrl');
	const url = urlInput.value.trim();

	if (!url) {
			statusEl.textContent = 'Please enter a Twitter video URL';
			return;
	}

	try {
			statusEl.textContent = 'Fetching video information...';

			// Call the API to get video information
			const apiUrl = `https://twitsave.com/info?url=${url}`;
			const response = await fetch(apiUrl);
			const text = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(text, 'text/html');

			// Find all video containers
			const videoContainers = doc.querySelectorAll('.origin-top-right');
			const tweetText = doc.querySelector('.leading-tight p.m-2')?.textContent || 'Twitter Video';

			if (videoContainers.length === 0) {
					statusEl.textContent = 'No videos found in the tweet.';
					return;
			}

			statusEl.textContent = `Found ${videoContainers.length} video(s). Downloading...`;

			// Process each video
			for (let i = 0; i < videoContainers.length; i++) {
					const container = videoContainers[i];
					const qualityButtons = container.querySelectorAll('a');
					const videoUrl = qualityButtons[0]?.href;

					if (!videoUrl) {
							statusEl.textContent = `Could not find download URL for video ${i + 1}`;
							continue;
					}

					// Add to Eagle using the API
					const itemId = await eagle.item.addFromURL(videoUrl, {
							name: videoContainers.length === 1 ? tweetText : `${tweetText}_video${i + 1}`,
							website: url,
							tags: ['twitter']
					});

					statusEl.textContent = `Imported video ${i + 1} of ${videoContainers.length}`;
			}

			statusEl.textContent = 'All videos imported successfully!';
			urlInput.value = '';

	} catch (error) {
			statusEl.textContent = `Error: ${error.message}`;
			console.error('Error:', error);
	}
}