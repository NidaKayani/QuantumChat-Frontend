import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#f3f2ef',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: '#fff',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: 24,
              color: '#b91c1c',
            }}
          >
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Widget crashed</h2>
            <p style={{ margin: 0, fontSize: 14 }}>{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
