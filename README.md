# Monarch Markdown

<div align="center">
  <img width="1200" height="475" alt="Monarch Markdown" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
  <img src="docs/images/screenshot.png" alt="Monarch Markdown Interface" width="100%" />
  <p><em>Monarch Markdown - A modern, AI-powered markdown editor</em></p>
</div>

<div align="center">
  <strong>A modern, AI-powered markdown editor with real-time preview, grammar checking, and intelligent content generation</strong>
</div>

<br />

<div align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#development">Development</a>
</div>

<br />

## ✨ Features

- **📝 Rich Markdown Editing** - Full-featured markdown editor with syntax highlighting and line numbers
- **👁️ Live Preview** - Real-time markdown preview with synchronized scrolling
- **🤖 AI-Powered Assistance** - Integrated Gemini AI for content generation, rewriting, and grammar correction
- **🔍 Find & Replace** - Advanced search with case sensitivity and replace functionality
- **✍️ Spell Checking** - Real-time spell checking with context menu suggestions
- **🎨 Beautiful UI** - Modern, dark-mode enabled interface with custom Monarch theme
- **📊 Document Statistics** - Word count, character count, and reading time estimation
- **🗣️ Text-to-Speech** - Built-in TTS functionality for document narration
- **📑 Document Outline** - Automatic heading extraction for easy navigation
- **💬 AI Chat Assistant** - Interactive chat interface with document manipulation tools
- **📤 Multi-Format Export** - Export as Markdown (.md) or styled HTML (.html)
- **📋 Templates** - Pre-built templates for blogs, meeting notes, reports, and more
- **📊 Mermaid Diagrams** - Create flowcharts, sequence diagrams, and more with Mermaid syntax
- **⏰ Version History** - Automatic version snapshots with restore capability
- **📑 Document Tabs** - Multi-document management (infrastructure ready)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Gemini API Key** - Get yours from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/bantoinese83/monarch-markdown.git
   cd monarch-markdown
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be generated in the `dist` directory.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 with custom Monarch theme
- **Markdown Processing**: Marked.js with custom renderer
- **AI Integration**: Google Gemini API (@google/genai)
- **Code Highlighting**: Highlight.js
- **Diagram Rendering**: Mermaid.js for flowcharts and diagrams
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run check` - Run all checks (type-check, lint, format)

## 🎯 Key Features in Detail

### AI-Powered Content Generation

- **Text Rewriting**: Transform your content with different tones (Formal, Informal, Professional, Witty, etc.)
- **Content Generation**: Generate markdown content from prompts
- **Image Generation**: Create images using AI and embed them in your document
- **Grammar & Spelling**: Automatic grammar and spelling correction
- **Chat Assistant**: Interactive AI assistant that can manipulate your document

### Editor Features

- **Split View**: Resizable editor and preview panes
- **Word Wrap**: Toggle word wrapping for better readability
- **Line Numbers**: Visual line numbering for code-like editing
- **Find & Replace**: Powerful search with history and suggestions
- **Spell Check**: Real-time spell checking with suggestions
- **Undo/Redo**: Full undo/redo support with keyboard shortcuts
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + F` - Open find dialog
  - `Ctrl/Cmd + S` - Export document
  - `Ctrl/Cmd + Z` - Undo
  - `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` - Redo
  - `Ctrl/Cmd + O` - Toggle outline panel
  - `Ctrl/Cmd + K` - Toggle AI chat
  - `Esc` - Close dialogs and panels

### Document Management

- **Auto-save**: Automatic saving to localStorage
- **Multi-Format Export**: Export as Markdown (.md) or styled HTML (.html) with responsive design
- **Version History**: Automatic snapshots every 2 minutes with manual restore capability
- **Templates**: Choose from pre-built templates (Blog Post, Meeting Notes, Project Report, Daily Notes, README) or create custom ones
- **Outline Panel**: Navigate through document headings
- **Statistics**: Track word count, character count, and reading time

### Advanced Markdown Features

- **Mermaid Diagrams**: Create diagrams using Mermaid syntax in code blocks
  ```mermaid
  graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Action 1]
      B -->|No| D[Action 2]
  ```
- **Extended Syntax**: Support for tables, code blocks, blockquotes, and more
- **Syntax Highlighting**: Code highlighting for 100+ programming languages

## 🏗️ Project Structure

```
monarch-markdown/
├── src/
│   ├── components/          # React components
│   │   ├── Editor.tsx       # Main markdown editor
│   │   ├── Preview.tsx      # Markdown preview with Mermaid support
│   │   ├── ChatPanel.tsx    # AI chat interface
│   │   ├── TemplatePicker.tsx # Template selection UI
│   │   ├── VersionHistory.tsx # Version history viewer
│   │   ├── DocumentTabs.tsx   # Multi-document tabs
│   │   └── ...
│   ├── services/            # API services
│   │   └── geminiService.ts # Gemini AI integration
│   ├── utils/               # Utility functions
│   │   ├── markdownUtils.ts # Markdown processing
│   │   ├── textUtils.ts     # Text manipulation
│   │   ├── audioUtils.ts    # Audio processing
│   │   ├── exportUtils.ts   # HTML/MD export utilities
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useDocuments.ts  # Document management
│   │   ├── useUndoRedo.ts   # Undo/redo functionality
│   │   └── ...
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript type definitions
│   ├── constants/           # Application constants & templates
│   └── index.css           # Tailwind CSS styles
```

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS with a custom Monarch theme. Configuration can be found in `tailwind.config.js`.

### TypeScript

Strict TypeScript mode is enabled. Configuration in `tsconfig.json`.

### ESLint & Prettier

Code quality is enforced through ESLint and Prettier. Configuration files:

- `eslint.config.js` - ESLint rules
- `.prettierrc.json` - Prettier formatting rules

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🆕 Recent Updates

### Version 2.0 Features

- ✨ **HTML Export** - Export documents as styled HTML with responsive design
- 📊 **Mermaid Diagrams** - Create flowcharts, sequence diagrams, Gantt charts, and more
- 📋 **Template System** - Pre-built templates for common document types
- ⏰ **Version History** - Automatic snapshots with restore functionality
- 📑 **Document Management** - Infrastructure for multi-document support

### How to Use New Features

**Export to HTML:**

- Click the download icon in the header
- Select "Export as .html" from the dropdown
- Get a fully styled, standalone HTML file

**Mermaid Diagrams:**

- Write Mermaid syntax in code blocks:
  ````markdown
  ```mermaid
  graph TD
      A[Start] --> B[End]
  ```
  ````

**Templates:**

- Click the file icon in the toolbar
- Browse templates by category
- Select a template to apply

**Version History:**

- Click the history icon in the toolbar
- View all saved versions
- Restore any previous version
- Export individual versions

## 🙏 Acknowledgments

- [Google Gemini](https://aistudio.google.com/) for AI capabilities
- [Marked.js](https://marked.js.org/) for markdown parsing
- [Mermaid.js](https://mermaid.js.org/) for diagram rendering
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://react.dev/) for the UI framework

---

<div align="center">
  Made with ❤️ using React, TypeScript, and AI
</div>
