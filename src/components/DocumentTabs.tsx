import React from 'react';
import { CloseIcon } from './icons';
import type { Document } from '@/src/types';

interface DocumentTabsProps {
  documents: Document[];
  activeDocumentId: string;
  onSelectDocument: (id: string) => void;
  onCloseDocument: (id: string, e: React.MouseEvent) => void;
  onNewDocument: () => void;
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCloseDocument,
  onNewDocument,
}) => {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-monarch-main bg-gray-50/50 dark:bg-monarch-bg/50 overflow-x-auto">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors cursor-pointer group ${
            activeDocumentId === doc.id
              ? 'border-monarch-accent bg-white dark:bg-monarch-bg-light'
              : 'border-transparent hover:bg-gray-100 dark:hover:bg-monarch-main/30'
          }`}
          onClick={() => onSelectDocument(doc.id)}
        >
          <span
            className={`text-sm whitespace-nowrap ${
              activeDocumentId === doc.id
                ? 'text-monarch-accent font-medium'
                : 'text-gray-600 dark:text-monarch-text-dark'
            }`}
          >
            {doc.title}
            {doc.isUnsaved && <span className="ml-1 text-orange-500">•</span>}
          </span>
          <button
            onClick={(e) => onCloseDocument(doc.id, e)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-monarch-main transition-opacity"
            title="Close document"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={onNewDocument}
        className="px-3 py-2 text-sm text-gray-500 dark:text-monarch-text-dark hover:text-monarch-accent hover:bg-gray-100 dark:hover:bg-monarch-main/30 transition-colors"
        title="New document"
      >
        +
      </button>
    </div>
  );
};

export default DocumentTabs;
