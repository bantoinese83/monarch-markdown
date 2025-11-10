import React, { useState } from 'react';
import { CloseIcon, DownloadIcon } from './icons';
import type { DocumentVersion } from '@/src/types';
import { downloadFile } from '@/src/utils';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  versions: DocumentVersion[];
  onRestore: (version: DocumentVersion) => void;
  documentTitle: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  isOpen,
  onClose,
  versions,
  onRestore,
  documentTitle,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleExportVersion = (version: DocumentVersion) => {
    downloadFile(
      version.content,
      `${documentTitle}-${version.id}.md`,
      'text/markdown;charset=utf-8'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-monarch-bg rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-monarch-main">
          <h2 className="text-xl font-bold text-gray-800 dark:text-monarch-text">
            Version History
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-monarch-main transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-200 dark:border-monarch-main p-4 overflow-y-auto">
            <div className="space-y-2">
              {versions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-monarch-text-dark">No versions yet</p>
              ) : (
                versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'bg-monarch-accent/20 text-monarch-accent font-semibold'
                        : 'text-gray-600 dark:text-monarch-text-dark hover:bg-gray-100 dark:hover:bg-monarch-main/50'
                    }`}
                  >
                    <div className="font-medium">{version.label || 'Auto-save'}</div>
                    <div className="text-xs text-gray-500 dark:text-monarch-text-dark mt-1">
                      {formatDate(version.createdAt)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedVersion ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-monarch-main flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-monarch-text">
                      {selectedVersion.label || 'Auto-save'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-monarch-text-dark">
                      {formatDate(selectedVersion.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportVersion(selectedVersion)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-monarch-main hover:bg-gray-200 dark:hover:bg-monarch-main/80 rounded-lg transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4 inline mr-1" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        onRestore(selectedVersion);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-sm bg-monarch-accent hover:bg-monarch-accent-hover text-white rounded-lg transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-monarch-text bg-gray-50 dark:bg-monarch-bg-light p-4 rounded-lg">
                    {selectedVersion.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-monarch-text-dark">
                Select a version to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
