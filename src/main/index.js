import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join, parse, resolve, extname } from 'path'
import { access, mkdir, readdir, stat } from 'fs/promises'
import sharp from 'sharp'
import icon from '../../resources/icon.png?asset'
import os from 'os' 

// --- PERFORMANCE OPTIMIZATIONS ---
sharp.cache(false)
const totalCores = os.cpus().length
sharp.concurrency(Math.max(1, Math.floor(totalCores / 2)))

const INPUT_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'])
const OUTPUT_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'tiff'])
const FORMAT_ALIASES = {
  jpg: 'jpeg',
  tif: 'tiff',
  original: 'original'
}

function normalizeInputPaths(inputPaths) {
  if (!Array.isArray(inputPaths)) return []
  return [...new Set(inputPaths)]
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value) => resolve(value.trim()))
}

function isSupportedInput(filePath) {
  return INPUT_EXTENSIONS.has(extname(filePath).toLowerCase())
}

function toOutputExtension(format) {
  if (format === 'jpeg') return 'jpg'
  if (format === 'tiff') return 'tif'
  return format
}

function sanitizeOptions(options) {
  const parsedQuality = Number.parseInt(options?.quality, 10)
  const quality = Number.isFinite(parsedQuality) ? Math.min(100, Math.max(1, parsedQuality)) : 80

  const rawFormat = typeof options?.format === 'string' ? options.format.toLowerCase() : 'original'
  const format = FORMAT_ALIASES[rawFormat] ?? rawFormat
  const outputFormat = format === 'original' || OUTPUT_FORMATS.has(format) ? format : 'original'

  const outputDir = typeof options?.outputDir === 'string' && options.outputDir.trim().length > 0
      ? resolve(options.outputDir.trim()) : ''

  const parsedWidth = Number.parseInt(options?.width, 10)
  const width = Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : null

  const parsedHeight = Number.parseInt(options?.height, 10)
  const height = Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : null

  return { quality, format: outputFormat, outputDir, width, height }
}

function resolveOutputFormat(sourcePath, requestedFormat) {
  if (requestedFormat && requestedFormat !== 'original') return requestedFormat
  const sourceExtension = extname(sourcePath).toLowerCase().replace('.', '')
  const format = FORMAT_ALIASES[sourceExtension] ?? sourceExtension
  return OUTPUT_FORMATS.has(format) ? format : null
}

function getOutputDirectory(sourcePath, selectedOutputDir) {
  if (selectedOutputDir) return selectedOutputDir
  return join(parse(sourcePath).dir, 'optimized')
}

async function pathExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

async function getUniqueOutputPath(directory, baseName, extension) {
  let attempt = 0
  while (true) {
    const suffix = attempt === 0 ? '-optimized' : `-optimized-${attempt}`
    const candidatePath = join(directory, `${baseName}${suffix}.${extension}`)
    if (!(await pathExists(candidatePath))) return candidatePath
    attempt += 1
  }
}

function applyOutputFormat(pipeline, format, quality) {
  if (format === 'jpeg') return pipeline.jpeg({ quality, mozjpeg: true })
  if (format === 'png') {
    const compressionLevel = Math.round(((100 - quality) / 100) * 9)
    return pipeline.png({ compressionLevel, progressive: true })
  }
  if (format === 'webp') return pipeline.webp({ quality, effort: 5 })
  if (format === 'avif') return pipeline.avif({ quality, effort: 4 })
  if (format === 'tiff') return pipeline.tiff({ quality, compression: 'jpeg' })
  throw new Error(`Unsupported output format: ${format}`)
}

// THE FIX: Flat 1-Layer Directory Reading
async function collectImageInputs(inputPaths) {
  const discovered = new Set()
  const images = []

  for (const currentPath of inputPaths) {
    if (!currentPath || discovered.has(currentPath)) continue

    discovered.add(currentPath)

    let currentStats
    try {
      currentStats = await stat(currentPath)
    } catch {
      continue
    }

    if (currentStats.isFile() && isSupportedInput(currentPath)) {
      images.push(currentPath)
    } else if (currentStats.isDirectory()) {
      let entries = []
      try {
        entries = await readdir(currentPath, { withFileTypes: true })
      } catch {
        continue
      }

      for (const entry of entries) {
        if (entry.isFile()) {
          const entryPath = join(currentPath, entry.name)
          if (isSupportedInput(entryPath) && !discovered.has(entryPath)) {
            discovered.add(entryPath)
            images.push(entryPath)
          }
        }
      }
    }
  }

  return images
}

async function optimizeImage(sourcePath, options) {
  const outputFormat = resolveOutputFormat(sourcePath, options.format)
  if (!outputFormat) throw new Error('Could not determine output format for this file.')

  const sourceStats = await stat(sourcePath)
  const outputDirectory = getOutputDirectory(sourcePath, options.outputDir)
  const outputExtension = toOutputExtension(outputFormat)
  const sourceName = parse(sourcePath).name

  await mkdir(outputDirectory, { recursive: true })
  const outputPath = await getUniqueOutputPath(outputDirectory, sourceName, outputExtension)

  let pipeline = sharp(sourcePath, { failOn: 'none' }).rotate()

  if (options.width || options.height) {
    const bothProvided = options.width && options.height
    pipeline = pipeline.resize(options.width, options.height, {
      fit: bothProvided ? 'fill' : 'inside',
      withoutEnlargement: true
    })
  }

  pipeline = applyOutputFormat(pipeline, outputFormat, options.quality)
  await pipeline.toFile(outputPath)

  const optimizedStats = await stat(outputPath)
  const savedBytes = sourceStats.size - optimizedStats.size
  const savingsPercent = sourceStats.size > 0 ? Number(((savedBytes / sourceStats.size) * 100).toFixed(2)) : 0

  return {
    status: 'success',
    inputPath: sourcePath,
    outputPath,
    originalBytes: sourceStats.size,
    optimizedBytes: optimizedStats.size,
    savedBytes,
    savingsPercent,
    outputFormat: outputExtension
  }
}

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    show: false,
    autoHideMenuBar: true, // Hides it but doesn't remove it entirely
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: false // 🚨 HARD LOCK: This disables DevTools at the engine level
    }
  })

  // 1. Remove the menu bar completely (Professional look + Security)
  mainWindow.removeMenu()

  // 2. Prevent keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isDevToolsKey = 
      (input.control && input.shift && input.key.toLowerCase() === 'i') || 
      (input.meta && input.alt && input.key.toLowerCase() === 'i') || 
      input.key === 'F12'

    if (isDevToolsKey) {
      event.preventDefault()
    }
  })

  // 3. Emergency Close if DevTools somehow opens
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools()
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('com.pixelspace')

  ipcMain.handle('optimizer:select-inputs', async () => {
    const selected = await dialog.showOpenDialog(mainWindow, {
      title: 'Select image files',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tif', 'tiff'] }]
    })
    if (selected.canceled) return []
    return normalizeInputPaths(selected.filePaths)
  })

  ipcMain.handle('optimizer:select-folder-input', async () => {
    const selected = await dialog.showOpenDialog(mainWindow, {
      title: 'Select a folder to process',
      properties: ['openDirectory']
    })
    if (selected.canceled || selected.filePaths.length === 0) return []
    return normalizeInputPaths(selected.filePaths)
  })

  ipcMain.handle('optimizer:select-output-folder', async () => {
    const selected = await dialog.showOpenDialog(mainWindow, {
      title: 'Select output folder',
      properties: ['openDirectory', 'createDirectory']
    })
    if (selected.canceled || selected.filePaths.length === 0) return ''
    return resolve(selected.filePaths[0])
  })

  ipcMain.handle('optimizer:open-path', async (_event, targetPath) => {
    if (typeof targetPath !== 'string' || targetPath.trim().length === 0) return false
    const normalizedPath = resolve(targetPath.trim())
    if (!(await pathExists(normalizedPath))) return false
    const openError = await shell.openPath(normalizedPath)
    return openError.length === 0
  })

  ipcMain.handle('optimizer:optimize-images', async (_event, payload = {}) => {
    const options = sanitizeOptions(payload.options)
    const inputPaths = normalizeInputPaths(payload.inputPaths)
    const imagePaths = await collectImageInputs(inputPaths)
    const results = []

    // THE PROGRESS BAR FIX: Using standard for-loop to send live pings
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i]
      try {
        const optimized = await optimizeImage(imagePath, options)
        results.push(optimized)
      } catch (error) {
        results.push({
          status: 'error',
          inputPath: imagePath,
          message: error instanceof Error ? error.message : 'Unknown processing error'
        })
      }

      // Send the live progress ping back to React
      _event.sender.send('optimizer:progress', {
        current: i + 1,
        total: imagePaths.length
      })
    }

    const successCount = results.filter((result) => result.status === 'success').length
    const failureCount = results.length - successCount

    // Determine the actual output directory that was used so the frontend can open it
    const firstSuccess = results.find((r) => r.status === 'success')
    const outputDirectory = firstSuccess
      ? parse(firstSuccess.outputPath).dir
      : options.outputDir || ''

    return { total: results.length, successCount, failureCount, results, outputDirectory }
  })

  createWindow()

  // --- AUTO UPDATER ---
  // Only check for updates in production — not during dev
  if (!process.env['ELECTRON_RENDERER_URL']) {
    autoUpdater.autoDownload = false // Don't download silently — wait for user confirmation
    autoUpdater.checkForUpdates()
  }

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update_available', { version: info.version })
  })

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update_downloaded')
  })

  ipcMain.handle('download_update', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.handle('restart_app', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('open_releases_page', () => {
    shell.openExternal('https://github.com/SuyashSharma1710/PixelSpace/releases')
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})