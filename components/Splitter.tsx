import React from 'react';

interface SplitterProps {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const Splitter: React.FC<SplitterProps> = ({ onMouseDown }) => {
  return (
    <div
      className="hidden md:flex items-center justify-center w-[5px] cursor-col-resize bg-gray-100 dark:bg-monarch-bg group transition-colors duration-200"
      onMouseDown={onMouseDown}
      aria-hidden="true"
    >
      <div className="w-px h-full bg-gray-200 dark:bg-monarch-main mx-auto transition-colors duration-200 group-hover:bg-monarch-accent"></div>
    </div>
  );
};

export default Splitter;
