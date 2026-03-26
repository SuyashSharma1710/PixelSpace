import { useState, useEffect } from 'react'
import DropZone from './components/DropZone'
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)

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

    const payload = {
      inputPaths,
      options: { format, quality: parseInt(quality) }
    }

    try {
      const response = await window.electronAPI.optimizeImages(payload)
      setResults(response)
    } catch (error) {
      console.error("Optimization failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setInputPaths([])
    setResults(null)
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

              <DropZone 
                onPathsAdded={handlePathsAdded} 
                onBrowse={handleBrowseInputs} 
                disabled={isProcessing} 
              />

              {/* --- ADD THIS NEW BLOCK RIGHT HERE --- */}
              {inputPaths.length > 0 && (
                <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                  <ul className="file-list" style={{ maxHeight: '140px' }}>
                    {inputPaths.map((path, index) => (
                      <li key={index}>
                        <span className="file-name">📁</span>
                        <span className="file-path" title={path}>{path}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
      

              <div className="control-group" style={{ marginTop: '20px' }}>
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

              <button 
                className="button primary run-button" 
                onClick={handleOptimize} 
                disabled={isProcessing || inputPaths.length === 0}
                style={{ marginTop: '15px' }}
              >
                {isProcessing ? 'Processing Images...' : `Optimize ${inputPaths.length} Item(s)`}
              </button>
            </main>

            {/* RIGHT COLUMN: Results */}
            <aside className="panel results-panel">
              <div className="panel-head">
                <h2>Results</h2>
              </div>
              
              {results ? (
                <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <article>
                    <h3>Successful</h3>
                    <p style={{ color: 'var(--primary-color)' }}>{results.successCount}</p>
                  </article>
                  <article>
                    <h3>Failed</h3>
                    <p style={{ color: results.failureCount > 0 ? '#ef4444' : 'inherit' }}>{results.failureCount}</p>
                  </article>
                </div>
              ) : (
                <p className="empty-state">
                  {inputPaths.length > 0 ? 'Ready to process.' : 'Drop some files to see results.'}
                </p>
              )}
            </aside>
          </div>
        </>
      ) : (
        /* --- PLACEHOLDER FOR THE IMAGE RESIZER --- */
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>Image Resizer Coming Soon</h2>
          <p className="empty-state">This is where we will build the exact pixel dimension adjuster.</p>
        </div>
      )}
    </div>
  )
}

export default App