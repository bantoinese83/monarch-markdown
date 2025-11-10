import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { EXPORT } from '@/src/constants';

/**
 * Exports markdown content as a styled HTML document
 */
export const exportToHTML = (markdown: string, title = EXPORT.DEFAULT_TITLE): string => {
  // Parse markdown to HTML
  const htmlContent = marked.parse(markdown, {
    gfm: true,
    breaks: true,
  }) as string;

  // Sanitize HTML
  const sanitized = DOMPurify.sanitize(htmlContent, {
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
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    KEEP_CONTENT: true,
  });

  // Create complete HTML document with styles
  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: #111827;
        color: #e5e7eb;
      }
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2.25em; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
    h2 { font-size: 1.75em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
    h3 { font-size: 1.5em; }
    h4 { font-size: 1.25em; }
    h5 { font-size: 1.1em; }
    h6 { font-size: 1em; color: #6b7280; }
    p {
      margin: 1em 0;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    code {
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    @media (prefers-color-scheme: dark) {
      code {
        background: #374151;
      }
    }
    pre {
      background: #f3f4f6;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1em 0;
    }
    @media (prefers-color-scheme: dark) {
      pre {
        background: #374151;
      }
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #9d5bff;
      padding-left: 1em;
      margin: 1em 0;
      color: #6b7280;
      font-style: italic;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li {
      margin: 0.5em 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 1em 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 0.5em 1em;
      text-align: left;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
    }
    @media (prefers-color-scheme: dark) {
      th {
        background: #374151;
      }
      th, td {
        border-color: #4b5563;
      }
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2em 0;
    }
    mark {
      background: #fef08a;
      padding: 0.1em 0.2em;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  ${sanitized}
</body>
</html>`;

  return htmlDocument;
};

/**
 * Downloads content as a file
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
