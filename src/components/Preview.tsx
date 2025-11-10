import React, { useEffect, useMemo, useRef } from 'react';
import { marked, Renderer, type Tokens } from 'marked';
import { Slugger } from '@/src/utils/slugger';

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
    if (!processedMarkdown || !processedMarkdown.trim()) {
      return '';
    }

    try {
      // Check if marked is available
      if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
        return window.DOMPurify.sanitize(`<p>Error: Markdown parser not loaded</p>`);
      }

      // Create renderer with custom heading handler for IDs
      const renderer = new Renderer();
      const slugger = new Slugger();

      // Store the original heading method
      const originalHeading = renderer.heading.bind(renderer);

      // Override heading to add IDs
      renderer.heading = (token: Tokens.Heading) => {
        // Call original to get base HTML
        const html = originalHeading(token);
        const { depth, text } = token;

        // Add ID for h1-h3
        if (depth <= 3 && text && text.trim()) {
          const id = slugger.slug(text);
          // Insert id attribute into the opening tag
          return html.replace(/<h(\d+)([^>]*)>/, `<h$1 id="${id}"$2>`);
        }
        return html;
      };

      // First, test basic parsing to ensure marked works
      const testResult = marked.parse('# Test') as string;
      if (!testResult || !testResult.includes('<h1>')) {
        throw new Error('Marked library is not functioning correctly');
      }

      // Parse markdown with custom renderer and options
      let result = marked.parse(processedMarkdown, {
        gfm: true,
        breaks: true,
        renderer: renderer,
      }) as string;

      // Ensure we have a string
      if (typeof result !== 'string') {
        result = String(result ?? '');
      }

      // Process Mermaid code blocks before sanitization
      // Mark Mermaid code blocks so we can render them later
      result = result.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi,
        '<pre><code class="language-mermaid">$1</code></pre>'
      );

      // Sanitize the HTML - use more permissive config to preserve formatting
      const cleaned = window.DOMPurify.sanitize(result, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          's',
          'del',
          'ins',
          'mark',
          'code',
          'pre',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'blockquote',
          'a',
          'img',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'hr',
          'div',
          'span',
          'svg',
          'g',
          'path',
          'circle',
          'rect',
          'line',
          'text',
          'polygon',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'class',
          'id',
          'target',
          'rel',
          'd',
          'x',
          'y',
          'width',
          'height',
          'fill',
          'stroke',
          'stroke-width',
          'data-mermaid-rendered',
        ],
        KEEP_CONTENT: true,
      });

      // Final validation
      if (!cleaned || cleaned.trim() === processedMarkdown.trim()) {
        // Return a formatted error message
        return window.DOMPurify.sanitize(
          `<div class="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
            <p class="text-red-600 dark:text-red-400 font-semibold">Markdown Preview Error</p>
            <p class="text-sm text-red-500 dark:text-red-300 mt-2">The markdown parser encountered an error.</p>
          </div>`
        );
      }

      return cleaned;
    } catch (error) {
      return window.DOMPurify.sanitize(
        `<div class="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
          <p class="text-red-600 dark:text-red-400 font-semibold">Markdown Preview Error</p>
          <p class="text-sm text-red-500 dark:text-red-300 mt-2">${error instanceof Error ? error.message : String(error)}</p>
        </div>`
      );
    }
  }, [processedMarkdown]);

  useEffect(() => {
    if (previewRef.current) {
      // Initialize Mermaid if available
      if (typeof window !== 'undefined' && window.mermaid) {
        const mermaid = window.mermaid;
        mermaid.initialize({ startOnLoad: false, theme: 'default' });

        // Find and render Mermaid diagrams
        const mermaidElements = previewRef.current.querySelectorAll(
          '.language-mermaid, code.language-mermaid'
        );
        mermaidElements.forEach((element, index) => {
          const codeElement = element.tagName === 'CODE' ? element : element.querySelector('code');
          if (codeElement && !codeElement.hasAttribute('data-mermaid-rendered')) {
            const mermaidCode = codeElement.textContent || '';
            const id = `mermaid-${Date.now()}-${index}`;
            codeElement.setAttribute('data-mermaid-rendered', 'true');

            // Create container for Mermaid diagram
            const container = document.createElement('div');
            container.className = 'mermaid';
            container.id = id;
            container.textContent = mermaidCode;

            // Replace code block with Mermaid container
            const preElement = codeElement.closest('pre');
            if (preElement) {
              preElement.replaceWith(container);
              mermaid.run({ nodes: [container] });
            }
          }
        });
      }

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
            .catch(() => {
              // Failed to copy text
            });
        };

        pre.appendChild(button);
      });
    }
  }, [parsedHtml]); // Rerun when HTML content changes

  // Empty state when no content
  if (!parsedHtml || parsedHtml.trim() === '' || parsedHtml === '<p></p>') {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white dark:bg-monarch-bg-light">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-monarch-main/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-monarch-text-dark/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-monarch-text mb-2">
            Preview will appear here
          </h3>
          <p className="text-sm text-gray-500 dark:text-monarch-text-dark/70">
            Start typing in the editor to see your markdown rendered in real-time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className="prose prose-sm md:prose-base dark:prose-invert max-w-none p-6 w-full h-full overflow-y-auto 
                 bg-white dark:bg-monarch-bg-light
                 prose-p:leading-6 md:prose-p:leading-7 prose-h1:tracking-tighter prose-h3:tracking-normal
                 prose-p:!text-[#1f2937] dark:prose-p:text-monarch-text!
                 prose-h1:!text-[#111827] dark:prose-h1:text-monarch-text! 
                 prose-h2:!text-[#111827] dark:prose-h2:!text-monarch-text 
                 prose-h3:!text-[#1f2937] dark:prose-h3:!text-monarch-text-dark
                 prose-h4:!text-[#1f2937] dark:prose-h4:!text-monarch-text-dark
                 prose-h5:!text-[#374151] dark:prose-h5:!text-monarch-text-dark
                 prose-h6:!text-[#374151] dark:prose-h6:!text-monarch-text-dark
                 prose-strong:!text-[#111827] dark:prose-strong:!text-monarch-text 
                 prose-a:!text-blue-600 dark:prose-a:!text-monarch-accent 
                 dark:hover:prose-a:!text-monarch-accent-hover 
                 prose-code:!text-[#111827] dark:prose-code:!text-monarch-accent 
                 prose-blockquote:!text-[#374151] dark:prose-blockquote:!text-monarch-text-dark
                 dark:prose-blockquote:border-l-monarch-accent
                 dark:prose-mark:bg-monarch-accent/40 dark:prose-mark:text-monarch-text dark:prose-mark:px-1 dark:prose-mark:rounded-sm
                 prose-li:!text-[#1f2937] dark:prose-li:!text-monarch-text
                 [&_.mermaid]:my-8 [&_.mermaid]:flex [&_.mermaid]:justify-center"
      style={{ color: '#1f2937' }}
      dangerouslySetInnerHTML={{ __html: parsedHtml || '' }}
    />
  );
};

export default Preview;
