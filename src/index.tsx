import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@/src/components';
import { MarkdownProvider, ToastProvider } from '@/src/contexts';
import '@/src/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <MarkdownProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MarkdownProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
