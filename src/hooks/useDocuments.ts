import { useState, useCallback, useEffect } from 'react';
import {
  STORAGE_KEYS,
  DOCUMENT_IDS,
  DOCUMENT_LABELS,
  MAX_VERSIONS_PER_DOCUMENT,
} from '@/src/constants';
import type { Document, DocumentVersion } from '@/src/types';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Failed to load documents
    }
    // Create initial document
    const initialDoc: Document = {
      id: `${DOCUMENT_IDS.PREFIX_DOC}${Date.now()}`,
      title: DOCUMENT_LABELS.UNTITLED,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [initialDoc];
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string>(documents[0]?.id || '');

  const [versions, setVersions] = useState<DocumentVersion[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VERSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save documents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch {
      // Failed to save
    }
  }, [documents]);

  // Save versions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
    } catch {
      // Failed to save
    }
  }, [versions]);

  const activeDocument = documents.find((d) => d.id === activeDocumentId) || documents[0];

  const createDocument = useCallback((content = '', title?: string) => {
    const newDoc: Document = {
      id: `${DOCUMENT_IDS.PREFIX_DOC}${Date.now()}`,
      title: title || DOCUMENT_LABELS.UNTITLED,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
    return newDoc.id;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc))
    );
  }, []);

  const deleteDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.id !== id);
        if (filtered.length === 0) {
          // Create a new document if all are deleted
          const newDoc: Document = {
            id: `${DOCUMENT_IDS.PREFIX_DOC}${Date.now()}`,
            title: DOCUMENT_LABELS.UNTITLED,
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setActiveDocumentId(newDoc.id);
          return [newDoc];
        }
        if (activeDocumentId === id) {
          setActiveDocumentId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeDocumentId]
  );

  const createVersion = useCallback((documentId: string, content: string, label?: string) => {
    const version: DocumentVersion = {
      id: `${DOCUMENT_IDS.PREFIX_VERSION}${Date.now()}`,
      documentId,
      content,
      createdAt: Date.now(),
      label,
    };
    setVersions((prev) => {
      // Keep only last N versions per document
      const docVersions = prev.filter((v) => v.documentId === documentId);
      const otherVersions = prev.filter((v) => v.documentId !== documentId);
      const newDocVersions = [...docVersions, version].slice(-MAX_VERSIONS_PER_DOCUMENT);
      return [...otherVersions, ...newDocVersions];
    });
    return version;
  }, []);

  const getDocumentVersions = useCallback(
    (documentId: string) => {
      // Use filter + sort efficiently - filter first to reduce sort operations
      const docVersions = versions.filter((v) => v.documentId === documentId);
      // Sort in-place for better performance
      return docVersions.sort((a, b) => b.createdAt - a.createdAt);
    },
    [versions]
  );

  return {
    documents,
    activeDocument,
    activeDocumentId,
    setActiveDocumentId,
    createDocument,
    updateDocument,
    deleteDocument,
    createVersion,
    getDocumentVersions,
  };
};
