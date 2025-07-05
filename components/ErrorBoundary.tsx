"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorModal from "./ErrorModal";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorModal
          open={true}
          onClose={() => {}}
          onRetry={this.handleRetry}
          error={this.state.error?.message || "An unexpected error occurred"}
          title="Development Error"
          isDevError={true}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
