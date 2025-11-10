import React, { useEffect, memo } from 'react';
import { TOAST_DURATION_MS } from '@/src/constants';
import type { Toast as ToastType } from '@/src/types';
import { CheckCircleIcon, StopIcon } from './icons';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = memo(({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, TOAST_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`flex items-center w-full max-w-xs p-4 space-x-3 rtl:space-x-reverse rounded-xl shadow-2xl dark:bg-monarch-bg-light bg-white mb-3 animate-scaleIn ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-monarch-main/30 hover:shadow-glow-md transition-all duration-300 cursor-pointer group`}
      role="alert"
      onClick={() => onDismiss(toast.id)}
    >
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
          isSuccess
            ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 shadow-sm'
            : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 shadow-sm'
        }`}
      >
        {isSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <StopIcon className="w-5 h-5" />}
        <span className="sr-only">{isSuccess ? 'Check' : 'Error'} icon</span>
      </div>
      <div className="ms-2 text-sm font-medium text-gray-800 dark:text-monarch-text flex-1">
        {toast.message}
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
