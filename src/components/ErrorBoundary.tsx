'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
            {/* Sad puppy icon */}
            <div className="text-6xl mb-4">🐶</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              Don&apos;t worry! Our puppy friend just needs a quick rest.
              Let&apos;s try again!
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 px-6 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleRefresh}
                className="w-full py-3 px-6 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {/* Show error details in development only */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Technical details (for developers)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
