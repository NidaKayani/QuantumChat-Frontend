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
        <div className="min-h-screen flex items-center justify-center bg-qc-bg p-6">
          <div className="qc-admin-card max-w-lg w-full p-8 text-center">
            <h1 className="text-xl font-bold text-qc-text mb-2">Something went wrong</h1>
            <p className="text-qc-muted text-sm mb-6">{this.state.error.message}</p>
            <button type="button" className="qc-admin-btn" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
