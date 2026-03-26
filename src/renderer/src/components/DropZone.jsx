import { useState } from 'react'

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

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    const droppedPaths = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Pass the file to our secure bridge to extract the hidden path!
      const absolutePath = window.electronAPI.getFilePath(file)
      
      if (absolutePath) {
        droppedPaths.push(absolutePath)
      }
    }

    if (droppedPaths.length > 0) {
      onPathsAdded(droppedPaths)
    } else {
      alert("Path extraction failed. Please check folder permissions or use 'Browse from disk'.")
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

export default DropZone