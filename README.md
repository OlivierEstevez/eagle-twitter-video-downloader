<img src="./docs/banner-docs.png">

# Eagle Twitter / X Video Downloader

This Eagle plugin lets you download high-quality videos and GIFs from Twitter / X and automatically add their URL and title.

## Features

- Download videos from Twitter / X tweets
- Download GIFs from Twitter / X tweets (auto-converted from MP4 to GIF via ffmpeg)
- Supports both `twitter.com` and `x.com` URLs
- Auto-imports to Eagle with tweet text as name and `twitter` tag

## Prerequisites

- **ffmpeg** (required for GIF downloads) — Install via [Homebrew](https://brew.sh/) (`brew install ffmpeg`), or download from [ffmpeg.org](https://ffmpeg.org/download.html). The plugin searches common locations including `~/.local/bin`, `/usr/local/bin`, and `/opt/homebrew/bin`.

## Installation

### Eagle Community
This plugin is published on the Eagle Community, so you can:

- Install it via [the community](https://community-en.eagle.cool/plugins)
- Search for it in the Plugin Center on the Eagle app

### Manual Install
1. Download [latest release](https://github.com/OlivierEstevez/eagle-twitter-video-downloader/releases)
2. In Eagle: Plugin → Developer options... → Import Local Project

## License

MIT © [Olivier Estévez](https://github.com/OlivierEstevez)