import React, { useEffect } from 'react';
import type { Toast as ToastType } from '../types';
import { CheckCircleIcon, StopIcon } from './icons';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse rounded-lg shadow-2xl dark:bg-monarch-bg-light bg-white mb-3 animate-fadeInDown ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10`}
      role="alert"
    >
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${isSuccess ? 'bg-green-100 dark:bg-green-900/50 text-green-500 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-300'}`}
      >
        {isSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <StopIcon className="w-5 h-5" />}
        <span className="sr-only">{isSuccess ? 'Check' : 'Error'} icon</span>
      </div>
      <div className="ms-3 text-sm font-normal text-gray-700 dark:text-monarch-text-dark">
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
