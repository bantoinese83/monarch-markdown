# Monarch Markdown

<div align="center">
  <img width="1200" height="475" alt="Monarch Markdown" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
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
- **📤 Export** - Export your markdown documents with a single click

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
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + F` - Open find dialog
  - `Esc` - Close dialogs and panels

### Document Management

- **Auto-save**: Automatic saving to localStorage
- **Export**: Download your markdown files
- **Outline Panel**: Navigate through document headings
- **Statistics**: Track word count, character count, and reading time

## 🏗️ Project Structure

```
monarch-markdown/
├── components/          # React components
│   ├── Editor.tsx       # Main markdown editor
│   ├── Preview.tsx      # Markdown preview
│   ├── ChatPanel.tsx    # AI chat interface
│   └── ...
├── services/            # API services
│   └── geminiService.ts # Gemini AI integration
├── utils/               # Utility functions
│   ├── markdownUtils.ts # Markdown processing
│   ├── textUtils.ts     # Text manipulation
│   └── audioUtils.ts    # Audio processing
├── types.ts             # TypeScript type definitions
├── constants.ts         # Application constants
└── index.css            # Tailwind CSS styles
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

## 🙏 Acknowledgments

- [Google Gemini](https://aistudio.google.com/) for AI capabilities
- [Marked.js](https://marked.js.org/) for markdown parsing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://react.dev/) for the UI framework

---

<div align="center">
  Made with ❤️ using React, TypeScript, and AI
</div>
