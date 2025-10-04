import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Something went wrong!</strong>
              <br />
              <details className="mt-2">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded">
                  {this.state.error?.toString()}
                </pre>
              </details>
              <button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;