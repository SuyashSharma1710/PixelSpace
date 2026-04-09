import { useState, useEffect } from 'react'
import FileDropZone from './components/FileDropZone'
import FolderDropZone from './components/FolderDropZone'
import logoImg from './assets/icon.png'
import logomoon from './assets/moon.svg'
import logosun from './assets/sun.svg'


function App() {
  // Theme and Navigation State
  const [theme, setTheme] = useState('light')
  const [activeTab, setActiveTab] = useState('compress') // 'compress' or 'resize'

  // Image Processing State
  const [inputPaths, setInputPaths] = useState([])
  const [format, setFormat] = useState('webp')
  const [quality, setQuality] = useState(80)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(null) // { current, total } | null

  // Input mode & output location (compress tab)
  const [inputMode, setInputMode] = useState('files') // 'files' | 'folder'
  const [outputDir, setOutputDir] = useState('')
  const [enableResizeInCompress, setEnableResizeInCompress] = useState(false)

  // Wire up live progress listener
  useEffect(() => {
    window.electronAPI.onProgress((data) => setProgress(data))
    return () => window.electronAPI.removeProgressListener()
  }, [])

  // Apply Theme to the DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Handle Drag & Drop
  const handlePathsAdded = (newPaths) => {
    setInputPaths((prev) => [...new Set([...prev, ...newPaths])])
  }

  // Handle Manual Browse Button
  const handleBrowseInputs = async () => {
    const selected = await window.electronAPI.selectInputs()
    if (selected.length > 0) {
      handlePathsAdded(selected)
    }
  }

  // Send everything to the Node.js backend to be processed
  const handleOptimize = async () => {
    if (inputPaths.length === 0) return

    setIsProcessing(true)
    setResults(null)
    setProgress(null)

    const isCompressTab = activeTab === 'compress'
    const sendResize = !isCompressTab || enableResizeInCompress

    const payload = {
      inputPaths,
      options: {
        format,
        quality: parseInt(quality),
        outputDir: outputDir || '',
        width: sendResize && width ? parseInt(width) : undefined,
        height: sendResize && height ? parseInt(height) : undefined
      }
    }

    try {
      const response = await window.electronAPI.optimizeImages(payload)
      setResults(response)
    } catch (error) {
      console.error("Optimization failed:", error)
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  // Folder mode uses a dedicated directory-only dialog
  const handleBrowseFolderInput = async () => {
    const selected = await window.electronAPI.selectFolderInput()
    if (selected.length > 0) handlePathsAdded(selected)
  }

  const handleClear = () => {
    setInputPaths([])
    setResults(null)
  }

  const handleSwitchMode = (mode) => {
    if (mode === inputMode) return
    setInputMode(mode)
    setInputPaths([])
    setResults(null)
  }

  const handleSelectOutputFolder = async () => {
    const selected = await window.electronAPI.selectOutputFolder()
    if (selected) setOutputDir(selected)
  }

  return (
    <div className="app-shell">
      {/* --- NEW HEADER TOP BAR --- */}
      <header className="app-header">
        <div className="logo-area">
          <img src={logoImg} alt="PixelSpace Logo" className="app-logo" />
          <span>PixelSpace</span>
        </div>
        
        <nav className="main-nav">
          <button 
            className={`nav-item ${activeTab === 'compress' ? 'active' : ''}`}
            onClick={() => setActiveTab('compress')}
          >
            Image Compress
          </button>
          <button 
            className={`nav-item ${activeTab === 'resize' ? 'active' : ''}`}
            onClick={() => setActiveTab('resize')}
          >
            Image Size Adjuster
          </button>
        </nav>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? (
            <>
              <img src={logomoon} alt="Dark Mode" className="theme-icon" /> Dark
            </>
          ) : (
            <>
              <img src={logosun} alt="Light Mode" className="theme-icon" /> Light
            </>
          )}
        </button>
      </header>

      {/* --- CONDITIONAL RENDERING BASED ON ACTIVE TAB --- */}
      {activeTab === 'compress' ? (
        <>
          <header className="hero">
            <p className="eyebrow">Local Processing</p>
            <h1>Batch Image Optimizer</h1>
            <p className="hero-subtitle">Compress and convert heavy images to modern web formats instantly, right on your machine.</p>
          </header>

          <div className="layout-grid">
            {/* LEFT COLUMN: Inputs & Settings */}
            <main className="panel">
              <div className="panel-head">
                <h2>Source Files</h2>
                {inputPaths.length > 0 && (
                  <button className="icon-button" onClick={handleClear} disabled={isProcessing}>
                    Clear All
                  </button>
                )}
              </div>

              {/* INPUT MODE TOGGLE */}
              <div className="input-mode-toggle">
                <button
                  className={`mode-btn ${inputMode === 'files' ? 'active' : ''}`}
                  onClick={() => handleSwitchMode('files')}
                  disabled={isProcessing}
                >
                  🖼 Drop Images
                </button>
                <button
                  className={`mode-btn ${inputMode === 'folder' ? 'active' : ''}`}
                  onClick={() => handleSwitchMode('folder')}
                  disabled={isProcessing}
                >
                  📂 Select Folder
                </button>
              </div>

              {/* FILES MODE */}
              {inputMode === 'files' ? (
                <div className="files-input-area">
                  <FileDropZone
                    onPathsAdded={handlePathsAdded}
                    onBrowse={handleBrowseInputs}
                    disabled={isProcessing}
                  />
                  {inputPaths.length > 0 && (
                    <div className="file-list-wrapper">
                      <ul className="file-list">
                        {inputPaths.map((path, index) => (
                          <li key={index}>
                            <span className="file-name">🖼</span>
                            <span className="file-path" title={path}>{path}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* FOLDER MODE */
                <div className="files-input-area">
                  <FolderDropZone
                    onFolderSelected={(path) => setInputPaths([path])}
                    onBrowse={handleBrowseFolderInput}
                    disabled={isProcessing}
                  />
                  {inputPaths.length > 0 && (
                    <div className="file-list-wrapper">
                      <ul className="file-list">
                        <li>
                          <span className="file-name">📂</span>
                          <span className="file-path" title={inputPaths[0]}>{inputPaths[0]}</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* OUTPUT LOCATION */}
              <div className="control-group">
                <label>Output Location</label>
                <div className="output-location">
                  <span className={`output-location-path ${outputDir ? 'has-value' : ''}`}>
                    {outputDir || 'Default — saved in /optimized next to source'}
                  </span>
                  {outputDir && (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setOutputDir('')}
                      disabled={isProcessing}
                      title="Clear output location"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-button"
                    onClick={handleSelectOutputFolder}
                    disabled={isProcessing}
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>Output Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={isProcessing}>
                  <option value="original">Keep Original Format</option>
                  <option value="webp">WebP (Best for Web)</option>
                  <option value="avif">AVIF (Next-Gen)</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div className="control-group">
                <div className="quality-row">
                  <label>Quality ({quality}%)</label>
                </div>
                <input 
                  type="range" min="1" max="100" 
                  value={quality} 
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              {/* ALSO RESIZE TOGGLE */}
              <label className="toggle-row">
                <span className="toggle-label">📌 Also Resize Images</span>
                <span className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={enableResizeInCompress}
                    onChange={(e) => setEnableResizeInCompress(e.target.checked)}
                    disabled={isProcessing}
                  />
                  <span className="toggle-track" />
                </span>
              </label>

              {/* WIDTH / HEIGHT — only shown when toggle is ON */}
              {enableResizeInCompress && (
                <>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <div className="control-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Width (px)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1920"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        disabled={isProcessing}
                        min="1"
                      />
                    </div>
                    <div className="control-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Height (px)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1080"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        disabled={isProcessing}
                        min="1"
                      />
                    </div>
                  </div>
                  <p className="eyebrow" style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 'normal' }}>Leave one blank to maintain aspect ratio automatically.</p>
                </>
              )}

              <button 
                className="button primary run-button" 
                onClick={handleOptimize} 
                disabled={isProcessing || inputPaths.length === 0}
              >
                {isProcessing
                  ? progress
                    ? `Processing ${progress.current} / ${progress.total}...`
                    : 'Starting...'
                  : `Optimize ${inputPaths.length} Item(s)`
                }
              </button>

              {/* PROGRESS BAR */}
              {isProcessing && progress && (
                <div style={{ marginTop: 'var(--space-xs)' }}>
                  <div style={{
                    height: '6px',
                    borderRadius: '99px',
                    background: 'var(--panel-border)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '99px',
                      background: 'var(--primary-color)',
                      width: `${Math.round((progress.current / progress.total) * 100)}%`,
                      transition: 'width 0.2s ease'
                    }} />
                  </div>
                  <p className="eyebrow" style={{
                    marginTop: 'var(--space-xs)',
                    color: 'var(--text-muted)',
                    textTransform: 'none',
                    letterSpacing: 'normal'
                  }}>
                    {Math.round((progress.current / progress.total) * 100)}% complete
                  </p>
                </div>
              )}
            </main>

            {/* RIGHT COLUMN: Results */}
            <aside className="panel results-panel">
              <div className="panel-head">
                <h2>Results</h2>
              </div>
              
              {results ? (
                <>
                  <div className="summary-grid">
                    <article>
                      <h3>Successful</h3>
                      <p className="summary-success">{results.successCount}</p>
                    </article>
                    <article>
                      <h3>Failed</h3>
                      <p className={results.failureCount > 0 ? 'summary-failure' : ''}>{results.failureCount}</p>
                    </article>
                  </div>
                  {results.outputDirectory && (
                    <button
                      className="button"
                      style={{ marginTop: 'var(--space-sm)', width: '100%' }}
                      onClick={() => window.electronAPI.openPath(results.outputDirectory)}
                    >
                      📂 Open Output Folder
                    </button>
                  )}
                </>
              ) : (
                <p className="empty-state">
                  {inputPaths.length > 0 ? 'Ready to process.' : 'Drop some files to see results.'}
                </p>
              )}
            </aside>
          </div>
        </>
      ) : (
        <>
          <header className="hero">
            <p className="eyebrow">Local Processing</p>
            <h1>Image Size Adjuster</h1>
            <p className="hero-subtitle">Resize images to exact pixel dimensions. Leave one field blank to preserve the aspect ratio automatically.</p>
          </header>

          <div className="layout-grid">
            {/* LEFT COLUMN: Inputs & Settings */}
            <main className="panel">
              <div className="panel-head">
                <h2>Source Files</h2>
                {inputPaths.length > 0 && (
                  <button className="icon-button" onClick={handleClear} disabled={isProcessing}>
                    Clear All
                  </button>
                )}
              </div>

              <FileDropZone
                onPathsAdded={handlePathsAdded}
                onBrowse={handleBrowseInputs}
                disabled={isProcessing}
              />

              {inputPaths.length > 0 && (
                <div className="file-list-wrapper">
                  <ul className="file-list">
                    {inputPaths.map((path, index) => (
                      <li key={index}>
                        <span className="file-name">📁</span>
                        <span className="file-path" title={path}>{path}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="panel-head" style={{ marginTop: 'var(--space-sm)' }}>
                <h2>Resize Images</h2>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <div className="control-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Width (px)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1920"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    disabled={isProcessing}
                    min="1"
                  />
                </div>
                <div className="control-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Height (px)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1080"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    disabled={isProcessing}
                    min="1"
                  />
                </div>
              </div>
              <p className="eyebrow" style={{ marginTop: 'var(--space-xs)', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 'normal' }}>Leave one blank to maintain aspect ratio automatically.</p>

              <div className="control-group" style={{ marginTop: 'var(--space-sm)' }}>
                <label>Output Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={isProcessing}>
                  <option value="original">Keep Original Format</option>
                  <option value="webp">WebP (Best for Web)</option>
                  <option value="avif">AVIF (Next-Gen)</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <button
                className="button primary run-button"
                onClick={handleOptimize}
                disabled={isProcessing || inputPaths.length === 0}
              >
                {isProcessing ? 'Processing Images...' : `Resize ${inputPaths.length} Item(s)`}
              </button>
            </main>

            <aside className="panel results-panel">
              <div className="panel-head">
                <h2>Results</h2>
              </div>

              {results ? (
                <div className="summary-grid">
                  <article>
                    <h3>Successful</h3>
                    <p className="summary-success">{results.successCount}</p>
                  </article>
                  <article>
                    <h3>Failed</h3>
                    <p className={results.failureCount > 0 ? 'summary-failure' : ''}>{results.failureCount}</p>
                  </article>
                </div>
              ) : (
                <p className="empty-state">
                  {inputPaths.length > 0 ? 'Ready to resize.' : 'Drop some files to see results.'}
                </p>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

export default App