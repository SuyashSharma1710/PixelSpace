import { useState } from 'react'
import PropTypes from 'prop-types'

const VALID_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'tif', 'tiff'])

function isValidImageEntry(name) {
  if (!name || name.startsWith('.')) return false
  const ext = name.split('.').pop().toLowerCase()
  return VALID_EXTENSIONS.has(ext)
}

async function readAllEntries(reader) {
  const allEntries = []
  while (true) {
    const batch = await new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject)
    })
    if (batch.length === 0) break
    allEntries.push(...batch)
  }
  return allEntries
}

async function collectPathsFromEntry(entry, collectedPaths) {
  if (entry.isFile) {
    if (!isValidImageEntry(entry.name)) return
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject))
    const absolutePath = window.electronAPI.getFilePath(file)
    if (absolutePath) collectedPaths.push(absolutePath)
  } else if (entry.isDirectory) {
    const reader = entry.createReader()
    const children = await readAllEntries(reader)
    for (const child of children) {
      await collectPathsFromEntry(child, collectedPaths)
    }
  }
}

function DropZone({ onPathsAdded, onBrowse, disabled }) {
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

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const items = Array.from(e.dataTransfer.items)
    const collectedPaths = []

    for (const item of items) {
      if (item.kind !== 'file') continue

      const entry = item.webkitGetAsEntry()
      if (!entry) continue

      await collectPathsFromEntry(entry, collectedPaths)
    }

    if (collectedPaths.length > 0) {
      onPathsAdded(collectedPaths)
    } else {
      alert('No supported images found. Supported formats: JPG, PNG, WebP, AVIF, TIFF.')
    }
  }

  return (
    <section
      className={`drop-zone ${isDragOver ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="drop-zone-title">Drag and drop images or folders</p>
      <p className="drop-zone-subtitle">Supports JPG, PNG, WebP, AVIF, and TIFF files.</p>
      <button type="button" className="button" onClick={onBrowse} disabled={disabled}>
        Browse from disk
      </button>
    </section>
  )
}

DropZone.propTypes = {
  onPathsAdded: PropTypes.func.isRequired,
  onBrowse: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default DropZone
