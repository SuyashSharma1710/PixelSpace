import { Component } from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="app-shell">
          <div
            className="panel"
            style={{ maxWidth: '600px', margin: '40px auto', padding: 'var(--space-lg)' }}
          >
            <h2 style={{ color: 'var(--color-danger)', marginTop: 0 }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              The application encountered an unexpected error. This could be due to a temporary
              issue.
            </p>
            <details
              style={{
                margin: 'var(--space-md) 0',
                color: 'var(--text-muted)',
                fontSize: 'var(--font-caption)'
              }}
            >
              <summary>Error details</summary>
              <pre
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-sm)',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '12px'
                }}
              >
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                className="button"
                onClick={this.handleReset}
                style={{ flex: 1 }}
              >
                Try again
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => window.location.reload()}
                style={{ flex: 1 }}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}

export default ErrorBoundary
