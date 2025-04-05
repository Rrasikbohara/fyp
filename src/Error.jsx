import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  // Add a method to handle the "Go Back Home" action
  handleGoHome = () => {
    // Use window.location for navigation in class components
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">We're sorry, but an error occurred while rendering the application.</p>
            <details className="mb-6">
              <summary className="cursor-pointer text-blue-600">Error details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {this.state.error && (this.state.error.toString())}
              </pre>
            </details>
            <button
              onClick={this.handleGoHome}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
