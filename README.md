# TextOr

**Professional-grade rich text editor with smart blocks, real-time collaboration, and multi-format export capabilities.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tiptap](https://img.shields.io/badge/Tiptap-2.0-purple)](https://tiptap.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Features

### Smart Blocks System
- **Executable Code Blocks**: Write and run JavaScript code directly in the editor with output preview
- **Dynamic Tables**: Sortable tables with add/remove columns and rows functionality
- **Callouts**: 5 types of styled callouts (Info, Warning, Error, Success, Tip)
- **Rich Formatting**: Bold, italic, strikethrough, code, headings (1-6), lists, blockquotes

### Command Palette 2.0
- **Slash Commands**: Type `/` to access 10+ block insertion commands
- **Dynamic Variables**: Insert current date, time, year with `{{date}}`, `{{time}}`, etc.
- **Inline Calculator**: Type `=100+250` and press space to auto-calculate
- **Emoji Picker**: Type `:` followed by emoji name for instant insertion (100+ emojis)

### Writing Quality Tools
- **Reading Time Estimator**: Real-time calculation based on 225 words/minute
- **Focus Mode**: Distraction-free writing with dimmed interface
- **Word Density Analysis**: See most frequently used words with visual bars
- **Sentiment Analysis**: AI-powered positive/negative/neutral tone detection
- **Quality Metrics**: Average words per sentence and sentences per paragraph

### Multi-Format Export
- **PDF Export**: Professional PDF generation with metadata
- **Markdown Export**: Clean .md files for developers
- **JSON Export**: Structured data with complete document tree
- **HTML Export**: Clean, semantic HTML with embedded styles

### Advanced Features
- **Undo/Redo**: 50-state history with immutable state management
- **Auto-Save**: Debounced saving every 2 seconds (simulated)
- **Link Preview**: Smart link handling with custom styling
- **Image Support**: Drag and drop with automatic optimization
- **Keyboard Shortcuts**: Full keyboard navigation support

## Architecture

### Clean Architecture Principles
```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── editor/         # Editor core components
│   │   ├── extensions/ # Custom Tiptap extensions
│   │   └── components/ # React node view components
│   ├── ui/             # Reusable UI components
│   └── pages/          # Page-level components
├── lib/                # Utilities and helpers
├── services/           # Business logic layer
├── repositories/       # Data access layer (Repository Pattern)
├── store/              # State management (Zustand + Immer)
└── types/              # TypeScript type definitions
```

### Design Decisions

**Why Tiptap over Slate?**
- Better React integration with hooks-based API
- More extensible architecture with ProseMirror foundation
- Active community and comprehensive documentation
- Superior performance for large documents

**Why Zustand over Redux?**
- Simpler API with less boilerplate
- Built-in middleware support (Immer for immutability)
- Better TypeScript inference
- Smaller bundle size (3.2kb vs 20kb+)

**Why Next.js 15 App Router?**
- Server Components for initial load performance
- Built-in API routes for future backend integration
- Optimized bundling and code splitting
- Native TypeScript support

### Data Model (AST-Based)

Documents are stored as Abstract Syntax Trees, not plain text:

```typescript
{
  "id": "doc_123",
  "title": "My Document",
  "content": [
    { 
      "type": "heading", 
      "data": { "level": 1, "text": "Welcome" } 
    },
    { 
      "type": "paragraph", 
      "data": { "text": "Hello world!" } 
    }
  ],
  "version": 1,
  "createdAt": "2026-01-18T00:00:00Z",
  "updatedAt": "2026-01-18T00:00:00Z"
}
```

## Tech Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0 (Strict Mode)
- **Runtime**: Node.js 22+
- **Editor Engine**: Tiptap 2.0 (ProseMirror)

### State & Data
- **State Management**: Zustand with Immer middleware
- **Validation**: Zod schemas
- **Immutability**: Immer for copy-on-write updates

### UI & Styling
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Utilities**: class-variance-authority, clsx, tailwind-merge

### Future Integrations
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (Upstash)
- **Auth**: NextAuth.js
- **Real-time**: Yjs + Hocuspocus (CRDTs)
- **Monitoring**: Sentry

## Getting Started

### Prerequisites
- Node.js 22 or higher
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ronaldmendzas/TextOr.git
cd TextOr

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Development

### Project Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright
```

### Testing Strategy

- **Unit Tests**: Function-level testing with Vitest
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user flow testing with Playwright

## Performance Optimizations

- **Debouncing**: All save operations debounced to 500ms
- **Memoization**: React.useMemo/useCallback for expensive operations
- **Code Splitting**: Dynamic imports for heavy modules (PDF generation)
- **Web Workers**: Offload export processing (planned)

## Accessibility (A11y)

- Full keyboard navigation support
- ARIA labels on all interactive elements
- Screen reader compatible
- Focus management in modals and menus

## Contributing

This project follows:
- **SOLID Principles**: Single Responsibility, Open/Closed, etc.
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **Clean Code**: Meaningful names, small functions, no comments

### Adding a New Extension

1. Create extension in `src/components/editor/extensions/`
2. Create React component in `src/components/editor/components/`
3. Register extension in `EditorPage.tsx`
4. Add command to `SlashCommandMenu.tsx`

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Author

**Ronald Mendoza**
- GitHub: [@ronaldmendzas](https://github.com/ronaldmendzas)

## Acknowledgments

- [Tiptap](https://tiptap.dev/) for the amazing editor framework
- [Next.js](https://nextjs.org/) for the React framework
- [Vercel](https://vercel.com/) for hosting
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
