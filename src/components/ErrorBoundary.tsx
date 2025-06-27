
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center p-4">
          <div className="bg-rap-charcoal border border-rap-gold/30 rounded-lg p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-rap-gold mx-auto mb-4" />
            <h2 className="text-2xl font-mogra text-rap-gold mb-4">Something went wrong</h2>
            <p className="text-rap-light mb-6">
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal"
              >
                Try Again
              </Button>
              <Button 
                onClick={this.handleReload}
                className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
