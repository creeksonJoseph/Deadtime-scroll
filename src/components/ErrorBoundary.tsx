import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // log to console for debugging
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, info);
  }

  clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background-dark text-white">
          <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-zinc-400 mb-4">
              The app encountered an error. This might be due to cached data.
            </p>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-black px-4 py-2 font-bold hover:bg-primary/80"
              >
                Refresh Page
              </button>
              <button
                onClick={this.clearCache}
                className="bg-zinc-700 text-white px-4 py-2 font-bold hover:bg-zinc-600"
              >
                Clear Cache & Refresh
              </button>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-zinc-400 mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap text-zinc-300 bg-zinc-800 p-3 rounded">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
