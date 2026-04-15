<div align="center">
<img alt="PixelSpace Logo" width="120" height="120" style="border-radius: 20px;" src="https://github.com/user-attachments/assets/4fa73555-1dc9-49b9-abcc-be15fedbd0f6" />

  <h1>PixelSpace</h1>
  <p><strong>Blazing‑fast, privacy‑first local batch image optimizer and resizer built for professionals.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/version-v1.1.20-06b6d4?style=for-the-badge" alt="Version" />
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

## ⚡ The Professional’s Image Workflow, Reimagined

PixelSpace is a premium desktop tool engineered to process thousands of images at native C++ speeds—**entirely on your machine**. No cloud uploads, no privacy compromises, no artificial limits. Built for designers, developers, and content creators who demand performance, control, and a seamless local experience.

### 🚀 Core Engineering Wins

- **Native C++ Processing** – Powered by [`sharp`](https://sharp.pixelplumbing.com/) (libvips) with intelligent CPU‑thread throttling. Crush folders of high‑resolution JPEGs/PNGs into modern WebP/AVIF while keeping your system responsive.
- **Deep Folder Traversal** – Bypass native browser drag‑and‑drop limitations. Process thousands of images from nested directories with a single selection—no manual file picking required.
- **Dual‑Mode Architecture** – Switch between **Batch Compress** (optimize for size/format) and **Exact Pixel Resizing** (anti‑blur logic, aspect‑ratio preservation) with a single click.
- **Cinematic UI with Hardware‑Accelerated Transitions** – Dark/Light mode cross‑fades powered by the View Transitions API. A polished, professional interface that feels as fast as the engine behind it.
- **Background Auto‑Updater** – Seamless updates delivered via `electron‑updater` and GitHub Releases. Stay on the latest version without interrupting your workflow.
- **Zero‑Leak Memory Management** – Internal caching disabled to prevent memory ballooning during massive batch operations. Process thousands of files without slowdowns.
- **100% Local & Private** – Your images never leave your computer. No internet required, no data sent to third‑party servers.

## 🛠 Tech Stack

PixelSpace is built with a modern, production‑ready stack:

- **Electron** – Robust cross‑platform desktop runtime.
- **React 19** – Declarative, component‑based UI.
- **Vite** – Lightning‑fast development and build tooling.
- **Sharp (libvips)** – High‑performance image processing in C++.
- **electron‑updater** – Enterprise‑grade auto‑update infrastructure.
- **electron‑builder** – Professional packaging for Windows, macOS, and Linux.

## 📦 Installation

### For End Users (No Compilation Needed)

1. Visit the [Releases](https://github.com/SuyashSharma1710/PixelSpace/releases/latest) page.
2. Download the latest `PixelSpace‑Setup‑*.exe` (Windows) or the appropriate installer for your platform.
3. Run the installer and start optimizing images immediately.

### For Developers & Contributors

Clone the repository and run PixelSpace locally:

```bash
git clone https://github.com/SuyashSharma1710/PixelSpace.git
cd PixelSpace
npm install
npm run dev
```

The development server will launch the app with hot‑reload enabled.

## 🏗️ Building the Executable

To compile a production‑ready Windows executable (or builds for other platforms), use the following scripts:

```bash
# Build for Windows (creates a signed installer)
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

All builds are configured in `electron‑builder.yml` and output to the `dist/` folder.

## 🧩 Project Structure

```
pixelspace/
├── build/                      # Icons and platform‑specific assets
├── dist/                       # Compiled installers (output)
├── src/
│   ├── main/                   # Electron main process
│   │   └── index.js            # Core image‑processing logic, auto‑updater, IPC
│   ├── preload/                # Secure bridge between main and renderer
│   │   └── index.js
│   └── renderer/               # React frontend
│       ├── src/
│       │   ├── assets/         # Styles, images, and icons
│       │   ├── components/     # Reusable UI components (DropZone, ErrorBoundary, etc.)
│       │   ├── App.jsx         # Dual‑mode UI (Compress / Resize)
│       │   └── main.jsx        # React entry point
│       └── index.html          # Root HTML template
├── electron‑builder.yml        # Packaging configuration
├── electron.vite.config.mjs    # Vite + Electron integration
└── package.json                # Dependencies and scripts
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**PixelSpace** – because your images deserve professional‑grade tools that respect your privacy and your time.
