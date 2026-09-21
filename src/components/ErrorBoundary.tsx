import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F6F3] p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-[#E6E1DC] text-center space-y-4">
            <h2 className="text-xl font-bold text-[#1E1D1B]">Citadel Group</h2>
            <p className="text-sm text-[#5C5A56]">
              A temporary issue occurred while loading this view.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left p-3 bg-red-50 text-red-800 rounded-lg overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-block px-5 py-2.5 bg-[#B87333] hover:bg-[#A05C3B] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
