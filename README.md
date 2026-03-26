<div align="center">
<img alt="PixelSpace Logo" width="120" height="120" style="border-radius: 20px;" src="https://github.com/user-attachments/assets/4fa73555-1dc9-49b9-abcc-be15fedbd0f6" />

  <h1>🌌 PixelSpace</h1>
  <p><strong>Lightning-fast, strictly local batch image optimization for modern workflows.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/version-v1.0.0-06b6d4?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white" alt="Electron" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
    <img src="https://img.shields.io/badge/License-MIT-4f46e5?style=for-the-badge" alt="License" />
  </p>
</div>
<br />

<div align="center">
  <img alt="PixelSpace Application Interface" src="https://github.com/user-attachments/assets/47366f21-3e84-4bd7-8007-95c698c0f94e" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" />
</div>

<br />

## ⚡ What is PixelSpace?

PixelSpace is a standalone desktop application built to crush massive image folders into modern, web-ready formats (WebP, AVIF) without sacrificing quality. 

Unlike web-based compressors, PixelSpace runs **100% locally** on your machine. No uploads, no internet required, and zero privacy concerns. It utilizes a highly optimized C++ image processing engine (`sharp`) under the hood, dynamically throttling your CPU threads so your computer stays usable while it churns through hundreds of files in the background.

## ✨ Key Features

* 🚀 **High-Performance Engine:** Powered by Sharp (C++) with intelligent CPU thread throttling.
* 🔒 **100% Local & Private:** Zero cloud uploads. Your files never leave your machine.
* 📂 **Smart Directory Scanning:** 1-layer deep folder reading to target specific images without destroying nested folder structures.
* ⚡ **Next-Gen Web Formats:** Convert heavy JPEGs/PNGs into ultra-lightweight **WebP** and **AVIF**.
* 🧠 **Zero-Leak Memory Management:** Internal caching disabled to prevent memory ballooning during massive batch workflows.
* 🎨 **Premium UI/UX:** Native drag-and-drop, real-time progress tracking, and custom Dark/Light mode cyberpunk aesthetics.

## 📥 Installation

You do not need to compile the code to use PixelSpace! 

1. Navigate to the [Releases](../../releases/latest) page.
2. Download the latest `PixelSpace-Setup-1.0.0.exe` file.
3. Double-click to install and start compressing!

## 🏗️ Directory Structure

~~~text
pixelspace/
├── build/                  # App icons for final .exe packaging
├── dist/                   # Compiled executables (Setup.exe) output
├── 📁 src
│   ├── 📁 main
│   │   └── 📄 index.js
│   ├── 📁 preload
│   │   └── 📄 index.js
│   └── 📁 renderer
│       ├── 📁 src
│       │   ├── 📁 assets
│       │   │   ├── 🎨 base.css
│       │   │   ├── 🖼️ electron.svg
│       │   │   ├── 📄 graphbg.avif
│       │   │   ├── 🖼️ icon.png
│       │   │   ├── 🎨 main.css
│       │   │   ├── 🖼️ moon.svg
│       │   │   ├── 🖼️ sun.svg
│       │   │   └── 🖼️ wavy-lines.svg
│       │   ├── 📁 components
│       │   │   ├── 📄 DropZone.jsx
│       │   │   └── 📄 Versions.jsx
│       │   ├── 📄 App.jsx
│       │   └── 📄 main.jsx
│       └── 🌐 index.html
├── electron-builder.yml    # Packager configuration
└── package.json            # Scripts & dependencies
~~~

## 💻 Developer Setup

Want to poke around the engine or build it yourself?

~~~bash
# Clone the repository
git clone https://github.com/SuyashSharma1710/pixelspace.git

# Navigate into the directory
cd pixelspace

# Install the dependencies
npm install

# Start the local development server
npm run dev

# Package the Windows .exe locally
npm run build:win/mac/linux
~~~

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
