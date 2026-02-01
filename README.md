<img src="./docs/banner-docs.png">

# Eagle Video Downloader

[English](./README.en.md) | 中文

从 **1000+ 网站**直接下载视频到 Eagle。基于 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 构建。

## 支持的平台

- YouTube
- Twitter / X
- TikTok
- Bilibili
- Instagram
- Vimeo
- 以及[更多平台...](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## 功能特性

- 🎬 **多平台支持**：支持 1000+ 视频网站下载
- 📦 **自动配置**：首次运行自动下载所需组件
- 🔄 **高质量下载**：自动选择最佳画质，使用 ffmpeg 合并音视频
- 🦅 **Eagle 集成**：自动导入视频到 Eagle 并保存元数据
- 🌐 **多语言支持**：支持中文和英文界面
- ⚡ **实时进度**：下载过程中显示实时进度反馈
- 🎯 **简洁界面**：极简设计，专注下载体验

## 安装方式

### Eagle 社区

插件已发布在 Eagle 社区：

- 通过 [Eagle 社区](https://community-cn.eagle.cool/plugins) 安装
- 或在 Eagle 应用的插件中心搜索安装

### 手动安装

1. 下载[最新版本](https://github.com/OlivierEstevez/eagle-twitter-video-downloader/releases)
2. 在 Eagle 中：插件 → 开发者选项... → 导入本地项目

## 首次运行

首次启动时，插件会自动下载必要组件：

- **yt-dlp** (~30MB) - 视频提取引擎
- **ffmpeg** (~80MB) - 用于音视频合并

这是一次性下载，请等待初始化完成。

## 使用方法

1. 从任意支持的网站复制视频链接
2. 粘贴到插件输入框中
3. 点击下载按钮开始下载
4. 下载完成后自动导入到 Eagle
5. 可以查看实时下载进度

## 开发指南

### 项目结构

```
├── index.html           # UI 界面（内嵌 CSS）
├── js/
│   ├── plugin.js        # 主入口文件
│   ├── ui.js            # UI 管理模块
│   ├── downloader.js    # 视频下载逻辑
│   ├── binary.js        # 二进制文件管理（yt-dlp/ffmpeg）
│   └── eagle.js         # Eagle API 集成
├── dist/plugin.js       # 打包输出文件（esbuild）
├── bin/                 # yt-dlp 和 ffmpeg 二进制文件（自动下载）
├── _locales/            # 国际化文件
│   ├── en.json          # 英文翻译
│   └── zh_CN.json       # 中文翻译
├── assets/              # 图标和资源
└── manifest.json        # Eagle 插件配置
```

### 开发命令

```bash
# 安装依赖
npm install

# 构建插件
npm run build

# 开发模式（监听文件变化）
npm run dev
```

### 技术栈

- **yt-dlp**：视频下载核心引擎
- **ffmpeg-static**：音视频合并处理
- **esbuild**：快速打包构建
- **i18next**：国际化支持

## 系统要求

- Eagle 3.0 或更高版本
- 网络连接（用于首次配置和下载视频）

## 开源协议

MIT © [Olivier Estévez](https://github.com/OlivierEstevez)

---

> **注意**：本工具仅供个人使用。请遵守视频平台的服务条款和您所在地区的版权法律。
