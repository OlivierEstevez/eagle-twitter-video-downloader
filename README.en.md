<img src="./docs/banner-docs.png">

# Eagle Video Downloader

English | [中文](./README.md)

Download videos directly to Eagle from **1000+ websites**. Built on [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Supported Platforms

- YouTube
- Twitter / X
- TikTok
- Bilibili
- Instagram
- Vimeo
- And [many more...](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## Features

- 🎬 **Multi-Platform Support**: Download from 1000+ video websites
- 📦 **Auto Configuration**: Automatically downloads required components on first run
- 🔄 **High Quality Downloads**: Auto-selects best quality, merges audio/video with ffmpeg
- 🦅 **Eagle Integration**: Automatically imports videos to Eagle with metadata
- 🌐 **Multi-Language**: Supports Chinese and English interfaces
- ⚡ **Real-Time Progress**: Live progress feedback during downloads
- 🎯 **Clean Interface**: Minimalist design focused on download experience

## Installation

### Eagle Community

The plugin is available on Eagle Community:

- Install via [Eagle Community](https://community-cn.eagle.cool/plugins)
- Or search in Eagle's plugin center

### Manual Installation

1. Download the [latest release](https://github.com/OlivierEstevez/eagle-twitter-video-downloader/releases)
2. In Eagle: Plugins → Developer Options... → Import Local Project

## First Run

On first launch, the plugin will automatically download necessary components:

- **yt-dlp** (~30MB) - Video extraction engine
- **ffmpeg** (~80MB) - For audio/video merging

This is a one-time download. Please wait for initialization to complete.

## Usage

1. Copy a video link from any supported website
2. Paste it into the plugin input box
3. Click the download button to start
4. Video will be automatically imported to Eagle after download
5. View real-time download progress

## Development Guide

### Project Structure

```
├── index.html           # UI interface (embedded CSS)
├── js/
│   ├── plugin.js        # Main entry point
│   ├── ui.js            # UI management module
│   ├── downloader.js    # Video download logic
│   ├── binary.js        # Binary file management (yt-dlp/ffmpeg)
│   └── eagle.js         # Eagle API integration
├── dist/plugin.js       # Build output (esbuild)
├── bin/                 # yt-dlp and ffmpeg binaries (auto-downloaded)
├── _locales/            # Internationalization files
│   ├── en.json          # English translations
│   └── zh_CN.json       # Chinese translations
├── assets/              # Icons and resources
└── manifest.json        # Eagle plugin configuration
```

### Development Commands

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Development mode (watch for changes)
npm run dev
```

### Tech Stack

- **yt-dlp**: Core video download engine
- **ffmpeg-static**: Audio/video merging
- **esbuild**: Fast bundling
- **i18next**: Internationalization support

## System Requirements

- Eagle 3.0 or higher
- Internet connection (for initial setup and video downloads)

## License

MIT © [Olivier Estévez](https://github.com/OlivierEstevez)

---

> **Note**: This tool is for personal use only. Please comply with the terms of service of video platforms and copyright laws in your region.
