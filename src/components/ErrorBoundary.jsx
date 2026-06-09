import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error tracking service
    console.error('[CRITICAL UI ERROR] Error Boundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    // Reset state and reload
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-dark)',
          color: 'var(--text-light)',
          fontFamily: 'var(--font-ar)',
          direction: 'rtl',
          padding: '20px'
        }}>
          <div className="contact-container" style={{
            maxWidth: '500px',
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '22px', color: 'var(--gold)', fontWeight: 700, margin: 0 }}>
              عذراً، حدث خطأ غير متوقع
            </h2>
            
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              واجه النظام صعوبة تقنية مؤقتة أثناء تحميل الصفحة. لا تقلق، بياناتك وأصولك في أمان تام.
            </p>

            <button
              onClick={this.handleReset}
              className="action-btn filled"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
              <span>إعادة تحميل الصفحة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
