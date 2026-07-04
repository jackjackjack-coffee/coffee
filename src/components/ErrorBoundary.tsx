import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level error boundary. All domain data lives in IndexedDB, so a render
 * crash loses nothing — offer a reload instead of a dead white screen.
 * (Deliberately unstyled-by-theme: it must render even if theming breaks.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Roasting Numbers] render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 12,
            padding: 24,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: 40 }} aria-hidden>
            ☕
          </span>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Something spilled.</h1>
          <p style={{ fontSize: 14, opacity: 0.7, maxWidth: 360 }}>
            The screen hit an error while rendering. Your data is safe in this browser&apos;s
            local database — reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid #d8cfc4',
              background: '#2e2118',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
