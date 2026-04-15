import { useState } from 'react'
import PropTypes from 'prop-types'

const VALID_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'tif', 'tiff'])

function isValidImage(filename) {
  if (!filename || filename.startsWith('.')) return false
  const ext = filename.split('.').pop().toLowerCase()
  return VALID_EXTENSIONS.has(ext)
}

function FileDropZone({ onPathsAdded, onBrowse, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const validPaths = []

    for (const file of files) {
      // Skip anything that looks like a directory (no valid image extension)
      if (!isValidImage(file.name)) continue

      const absolutePath = window.electronAPI.getFilePath(file)
      if (absolutePath) validPaths.push(absolutePath)
    }

    if (validPaths.length > 0) {
      onPathsAdded(validPaths)
    } else {
      alert(
        'No supported images found in the dropped items.\n' +
          'Supported formats: JPG, PNG, WebP, AVIF, TIFF.\n\n' +
          'To process a whole folder, switch to "Select Folder" mode.'
      )
    }
  }

  return (
    <section
      className={`drop-zone ${isDragOver ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="drop-zone-title">Drag and drop images here</p>
      <p className="drop-zone-subtitle">Supports JPG, PNG, WebP, AVIF, and TIFF files.</p>
      <button type="button" className="button" onClick={onBrowse} disabled={disabled}>
        Browse Files
      </button>
    </section>
  )
}

FileDropZone.propTypes = {
  onPathsAdded: PropTypes.func.isRequired,
  onBrowse: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default FileDropZone
