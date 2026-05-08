eagle.onPluginCreate(async (plugin) => {
	updateTheme();
	console.log('eagle.onPluginCreate');
	console.log(plugin);

	document.getElementById("twitterUrl").focus()
	document.getElementById("twitterUrl").addEventListener('input', clearError);

	document.getElementById("closeButton").addEventListener("click", () => {
		window.close()
	})

	const settingsOverlay = document.getElementById('settingsOverlay');

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			if (settingsOverlay.classList.contains('open')) {
				settingsOverlay.classList.remove('open');
			} else {
				window.close();
			}
		}
	})

	document.getElementById('settingsButton').addEventListener('click', () => {
		settingsOverlay.classList.toggle('open');
	});

	document.getElementById('clipboardButton').addEventListener('click', pasteClipboardToInput);

	const autoCloseCheckbox = document.getElementById('autoClose');
	autoCloseCheckbox.checked = localStorage.getItem('autoClose') === 'true';
	autoCloseCheckbox.addEventListener('change', () => {
		localStorage.setItem('autoClose', autoCloseCheckbox.checked);
	});

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
	htmlEl.style.visibility = 'visible';
}

const clearError = () => {
	const statusEl = document.getElementById('status');
	const urlInput = document.getElementById('twitterUrl');
	statusEl.textContent = '';
	statusEl.classList.remove('error');
	urlInput.classList.remove('error');
}

const returnError = (message) => {
	const statusEl = document.getElementById('status');
	const urlInput = document.getElementById('twitterUrl');
	statusEl.textContent = message;
	statusEl.classList.add('error');
	urlInput.classList.add('error');
}

async function pasteClipboardToInput() {
	const urlInput = document.getElementById('twitterUrl');

	try {
		const text = await eagle.clipboard.readText();
		const value = text.trim();

		if (!value) {
			returnError('Clipboard is empty');
			urlInput.focus();
			return;
		}

		urlInput.value = value;
		clearError();
		urlInput.focus();
	} catch (error) {
		returnError('Could not read clipboard');
		console.error('Clipboard error:', error);
	}
}

async function downloadAndImport() {
	const statusEl = document.getElementById('status');
	const urlInput = document.getElementById('twitterUrl');
	const url = urlInput.value.trim();

	// Check if URL is specifically from Twitter/X
	const twitterRegex = /^https?:\/\/(www\.)?(twitter|x)\.com\/\w+\/status\/\d+/i;
	if (!url) {
		statusEl.textContent = 'Please enter a Twitter/X video URL';
		return;
	}

	if (!twitterRegex.test(url)) {
		returnError('Please enter a valid Twitter/X URL');
		return;
	}

	try {
			statusEl.textContent = 'Fetching video information...';

			const response = await fetch('https://eagle-twitter-video-api.vercel.app/api/extract', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			const data = await response.json();

			if (!response.ok) {
				const ERROR_MESSAGES = {
					NO_VIDEO: 'This tweet does not contain a video',
					UNSUPPORTED: 'This type of content is not supported',
					UNAVAILABLE: 'This tweet is private or unavailable',
					RATE_LIMITED: 'Service is temporarily busy, please try again later',
				};
				returnError(ERROR_MESSAGES[data.code] || 'Something went wrong, please try again');
				return;
			}

			statusEl.textContent = 'Downloading video...';

			const caption = data.caption
				?.replace(/https?:\/\/\S+/gi, '')
				.replace(/\s{2,}/g, ' ')
				.trim();

			await eagle.item.addFromURL(data.video_url, {
        name: caption || "Twitter Video",
        website: url,
        tags: ["twitter"],
      });

			statusEl.textContent = 'Video imported successfully!';
			urlInput.value = '';

			if (localStorage.getItem('autoClose') === 'true') {
				setTimeout(() => window.close(), 1000);
			}

	} catch (error) {
			returnError('Could not connect to the server, please try again');
			console.error('Error:', error);
	}
}
