"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-red-50">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-black text-[#0e111d]">
            Đã xảy ra lỗi
          </h2>

          <p className="mt-2 max-w-md text-sm font-medium leading-6 text-[#6b7280]">
            Trang này gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ
            hỗ trợ nếu lỗi tiếp tục xảy ra.
          </p>

          {this.state.error && (
            <details className="mt-4 w-full max-w-lg rounded-xl border border-[#e8eaf1] bg-[#fafbfc] p-3 text-left">
              <summary className="cursor-pointer text-xs font-bold text-[#6b7280]">
                Chi tiết lỗi (dành cho kỹ thuật)
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs font-mono text-red-600">
                {this.state.error.message}
              </pre>
            </details>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-xl bg-[#ff8d28] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e67d1f]"
            >
              Thử lại
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="rounded-xl border border-[#e8eaf1] bg-white px-5 py-2.5 text-sm font-bold text-[#4b5563] transition hover:bg-[#f9fafb]"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
