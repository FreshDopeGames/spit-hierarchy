import React from 'react';
import { handleError } from '@/utils/errorHandler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleError(error, 'ErrorBoundary');
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
    <div className="text-center p-8 max-w-md">
      <h1 className="text-2xl font-bold text-[var(--theme-primary)] mb-4">
        Something went wrong
      </h1>
      <p className="text-[var(--theme-textMuted)] mb-6">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-background)] rounded-lg hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  </div>
);

export default ErrorBoundary;