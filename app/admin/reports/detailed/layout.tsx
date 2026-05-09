import ErrorBoundary from '@/app/ErrorBoundary';

export default function DetailedReportLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
