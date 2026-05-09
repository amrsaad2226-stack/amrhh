'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 md:p-8 space-y-6 text-center" dir="rtl">
          <h1 className="text-2xl font-black text-red-500">حدث خطأ غير متوقع</h1>
          <p className="text-slate-500">نحن آسفون، لقد حدث خطأ ما. يرجى محاولة تحديث الصفحة.</p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            حاول مرة أخرى
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
