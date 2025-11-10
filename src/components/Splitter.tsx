import React from 'react';

interface SplitterProps {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const Splitter: React.FC<SplitterProps> = ({ onMouseDown }) => {
  return (
    <div
      className="hidden md:flex items-center justify-center w-1.5 cursor-col-resize bg-gray-100 dark:bg-monarch-bg group transition-all duration-200 hover:w-2 hover:bg-gray-200 dark:hover:bg-monarch-main relative"
      onMouseDown={onMouseDown}
      aria-hidden="true"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panels"
    >
      <div className="w-0.5 h-full bg-gray-300 dark:bg-monarch-main mx-auto transition-all duration-200 group-hover:w-1 group-hover:bg-monarch-accent group-hover:shadow-glow-sm"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-1 h-8 bg-monarch-accent rounded-full"></div>
      </div>
    </div>
  );
};

export default Splitter;
