import React, { useState, useRef, useCallback, useEffect } from 'react';

export const useSplitter = () => {
  const [editorWidth, setEditorWidth] = useState(50);
  const isResizing = useRef(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isResizing.current = true;
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !mainContentRef.current) return;
    const containerRect = mainContentRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newWidth > 15 && newWidth < 85) {
      setEditorWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    editorWidth,
    mainContentRef,
    handleMouseDown,
  };
};
