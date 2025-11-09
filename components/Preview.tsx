import React, { useEffect, useMemo, useRef } from 'react';
import { marked, Renderer } from 'marked';
import { Slugger } from '../utils/slugger';

interface PreviewProps {
  markdown: string;
  highlightedChunk?: string | null;
}

const Preview: React.FC<PreviewProps> = ({ markdown, highlightedChunk }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const processedMarkdown = useMemo(() => {
    if (highlightedChunk) {
      // This is a simple and naive implementation. For complex markdown, a more robust
      // AST-based approach would be better to avoid breaking syntax.
      // It's safe here because we control the chunks and they are sentence-like.
      const escapedChunk = highlightedChunk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return markdown.replace(escapedChunk, `<mark>${highlightedChunk}</mark>`);
    }
    return markdown;
  }, [markdown, highlightedChunk]);

  const parsedHtml = useMemo(() => {
    const renderer = new Renderer();
    const slugger = new Slugger();

    // Add IDs to h1, h2, h3 for the outline functionality
    renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
      if (depth <= 3) {
        const id = slugger.slug(text);
        return `<h${depth} id="${id}">${text}</h${depth}>`;
      }
      return `<h${depth}>${text}</h${depth}>`;
    };

    const dirty = marked.parse(processedMarkdown, { gfm: true, breaks: true, renderer });
    const sanitized = typeof dirty === 'string' ? dirty : String(dirty ?? '');
    return window.DOMPurify.sanitize(sanitized);
  }, [processedMarkdown]);

  useEffect(() => {
    if (previewRef.current) {
      // highlightAll is a bit of a sledgehammer, but it works fine here.
      // For larger apps, a more targeted approach might be better.
      window.hljs.highlightAll();

      // Add copy buttons to all <pre> elements for a better UX
      const codeBlocks = previewRef.current.querySelectorAll('pre');
      codeBlocks.forEach((pre) => {
        if (pre.querySelector('.copy-code-button')) return; // Button already exists

        const codeEl = pre.querySelector('code');
        if (!codeEl) return; // No code element found

        pre.classList.add('group');
        pre.style.position = 'relative';

        const button = document.createElement('button');
        const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

        button.className =
          'copy-code-button absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-monarch-bg-light/80 backdrop-blur-sm hover:bg-monarch-main text-monarch-text-dark opacity-20 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-monarch-accent hover:scale-110';
        button.setAttribute('aria-label', 'Copy code');
        button.title = 'Copy code';
        button.innerHTML = copyIcon;

        button.onclick = () => {
          navigator.clipboard
            .writeText(codeEl.innerText)
            .then(() => {
              button.innerHTML = checkIcon;
              setTimeout(() => {
                button.innerHTML = copyIcon;
              }, 2000);
            })
            .catch((err) => console.error('Failed to copy text: ', err));
        };

        pre.appendChild(button);
      });
    }
  }, [parsedHtml]); // Rerun when HTML content changes

  return (
    <div
      ref={previewRef}
      className="prose prose-sm md:prose-base dark:prose-invert max-w-none p-6 w-full h-full overflow-y-auto 
                 prose-p:leading-6 md:prose-p:leading-7 prose-h1:tracking-tighter prose-h3:tracking-normal
                 dark:prose-h1:text-monarch-text dark:prose-h2:text-monarch-text dark:prose-h3:text-monarch-text-dark 
                 dark:prose-strong:text-monarch-text dark:prose-a:text-monarch-accent dark:hover:prose-a:text-monarch-accent-hover 
                 dark:prose-code:text-monarch-accent dark:prose-blockquote:border-l-monarch-accent
                 dark:prose-mark:bg-monarch-accent/40 dark:prose-mark:text-monarch-text dark:prose-mark:px-1 dark:prose-mark:rounded-sm"
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
};

export default Preview;
