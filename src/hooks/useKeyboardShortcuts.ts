import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onToggleFind: () => void;
  onCloseFind: () => void;
  onCloseContextMenu: () => void;
  onCloseChat: () => void;
  onCloseOutline: () => void;
  onExport?: () => void;
  onToggleOutline?: () => void;
  onToggleChat?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const useKeyboardShortcuts = ({
  onToggleFind,
  onCloseFind,
  onCloseContextMenu,
  onCloseChat,
  onCloseOutline,
  onExport,
  onToggleOutline,
  onToggleChat,
  onUndo,
  onRedo,
}: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Ctrl/Cmd + Z: Undo (only if not in input field or with Shift)
      if (isModifier && event.key === 'z' && !event.shiftKey) {
        if (!isInputFocused) {
          event.preventDefault();
          onUndo?.();
          return;
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (isModifier && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        if (!isInputFocused) {
          event.preventDefault();
          onRedo?.();
          return;
        }
      }

      // Ctrl/Cmd + F: Toggle Find
      if (isModifier && event.key === 'f') {
        event.preventDefault();
        onToggleFind();
        return;
      }

      // Ctrl/Cmd + S: Export
      if (isModifier && event.key === 's') {
        event.preventDefault();
        onExport?.();
        return;
      }

      // Ctrl/Cmd + O: Toggle Outline
      if (isModifier && event.key === 'o') {
        event.preventDefault();
        onToggleOutline?.();
        return;
      }

      // Ctrl/Cmd + K: Toggle Chat
      if (isModifier && event.key === 'k') {
        event.preventDefault();
        onToggleChat?.();
        return;
      }

      // Escape: Close all dialogs/panels
      if (event.key === 'Escape') {
        onCloseFind();
        onCloseContextMenu();
        onCloseChat();
        onCloseOutline();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onToggleFind,
    onCloseFind,
    onCloseContextMenu,
    onCloseChat,
    onCloseOutline,
    onExport,
    onToggleOutline,
    onToggleChat,
    onUndo,
    onRedo,
  ]);
};
