import { useState } from 'react'

function FolderDropZone({ onFolderSelected, onBrowse, disabled }) {
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

    // Grab only the first dropped item — we want a single folder path.
    // The backend's collectImageInputs() will scan its contents recursively.
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const firstItem = files[0]
    const absolutePath = window.electronAPI.getFilePath(firstItem)

    if (absolutePath) {
      onFolderSelected(absolutePath)
    } else {
      alert('Could not read the dropped folder path. Please use "Browse Folder" instead.')
    }
  }

  return (
    <section
      className={`drop-zone ${isDragOver ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="drop-zone-title">Drag and drop a single folder here</p>
      <p className="drop-zone-subtitle">All images inside will be processed</p>
      <button type="button" className="button" onClick={onBrowse} disabled={disabled}>
        Browse Folder
      </button>
    </section>
  )
}

export default FolderDropZone
