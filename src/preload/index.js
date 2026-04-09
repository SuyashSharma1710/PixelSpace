import { contextBridge, ipcRenderer, webUtils } from 'electron'

const api = {
  selectInputs: () => ipcRenderer.invoke('optimizer:select-inputs'),
  selectFolderInput: () => ipcRenderer.invoke('optimizer:select-folder-input'),
  selectOutputFolder: () => ipcRenderer.invoke('optimizer:select-output-folder'),
  openPath: (targetPath) => ipcRenderer.invoke('optimizer:open-path', targetPath),
  optimizeImages: (payload) => ipcRenderer.invoke('optimizer:optimize-images', payload),
  
  onProgress: (callback) => {
    ipcRenderer.on('optimizer:progress', (_event, data) => callback(data))
  },
  removeProgressListener: () => ipcRenderer.removeAllListeners('optimizer:progress'),

  // THE FIX: Use Electron's native webUtils to securely extract the hidden OS path
  getFilePath: (file) => {
    if (typeof webUtils !== 'undefined' && webUtils.getPathForFile) {
      return webUtils.getPathForFile(file)
    }
    // Fallback for older versions
    return file.path 
  }
}

try {
  contextBridge.exposeInMainWorld('electronAPI', api)
} catch (error) {
  console.error(error)
}