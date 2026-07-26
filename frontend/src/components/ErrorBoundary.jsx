import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-eco-bg px-6">
          <div className="bg-white border border-eco-border rounded-2xl p-8 shadow-xs max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-display font-bold text-eco-dark">
              Something went wrong
            </h1>
            <p className="text-sm text-eco-muted">
              An unexpected error occurred. This has been logged. Try returning to the dashboard —
              if the problem continues, please contact support.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full h-11 bg-eco-primary text-white font-semibold rounded-lg hover:bg-eco-primary-hover transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
