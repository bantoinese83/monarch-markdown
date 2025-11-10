import React, { useState } from 'react';
import { DEFAULT_TEMPLATES, STORAGE_KEYS } from '@/src/constants';
import type { Template } from '@/src/types';
import { CloseIcon } from './icons';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customTemplates] = useState<Template[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  });

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
  const categories = ['all', ...new Set(allTemplates.map((t) => t.category))];

  const filteredTemplates =
    selectedCategory === 'all'
      ? allTemplates
      : allTemplates.filter((t) => t.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-monarch-bg rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-monarch-main">
          <h2 className="text-xl font-bold text-gray-800 dark:text-monarch-text">
            Choose a Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-monarch-main transition-colors"
            aria-label="Close template picker"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-gray-200 dark:border-monarch-main p-4 overflow-y-auto">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-monarch-accent/20 text-monarch-accent font-semibold'
                      : 'text-gray-600 dark:text-monarch-text-dark hover:bg-gray-100 dark:hover:bg-monarch-main/50'
                  }`}
                  aria-label={`Filter templates by ${category}`}
                  aria-pressed={selectedCategory === category}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="text-left p-4 border border-gray-200 dark:border-monarch-main rounded-lg hover:border-monarch-accent hover:shadow-lg transition-all"
                  aria-label={`Select template: ${template.name}`}
                >
                  <h3 className="font-semibold text-gray-800 dark:text-monarch-text mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-monarch-text-dark mb-2">
                    {template.description}
                  </p>
                  <span className="text-xs text-monarch-accent capitalize">
                    {template.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePicker;
