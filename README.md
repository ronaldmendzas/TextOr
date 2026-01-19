# TextOr ✍️

A modern, smart text editor built with Next.js 15, TypeScript, and Tailwind CSS. Features AI-powered autocorrection, emoji shortcuts, and a block-based editing experience.

![TypeScript](https://img.shields.io/badge/TypeScript-96.9%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🤖 AI Autocorrect (Free - LanguageTool)
- **Auto-correct on punctuation** - Text is corrected when you type `. , ! ? ; :`
- **Automatic language detection** - Supports English and Spanish
- **Smart capitalization** - Won't change `is` to `ISS` or similar

### 😀 Emoji Shortcuts (400+)
Type any keyword followed by punctuation and the emoji is added automatically:

| You type | Result |
|----------|--------|
| `cat.` | `cat 🐱.` |
| `fire,` | `fire 🔥,` |
| `rocket!` | `rocket 🚀!` |
| `pizza.` | `pizza 🍕.` |
| `love?` | `love 😍?` |

**Categories:** Animals, Vehicles, Food, Places, Gestures, Weather, Sports, and more!

### 🎨 Rich Text Formatting
- **Bold** (Ctrl+B)
- *Italic* (Ctrl+I)
- <u>Underline</u> (Ctrl+U)
- ~~Strikethrough~~
- `Code` formatting
- [Links]()

### 📝 Block-Based Editor
- Paragraph blocks
- Heading blocks (H1, H2, H3)
- Quote blocks
- Code blocks with syntax highlighting
- List blocks (ordered & unordered)
- Divider blocks

### ⚡ Slash Commands
Type `/` to open the command menu:
- `/h1`, `/h2`, `/h3` - Headings
- `/quote` - Block quote
- `/code` - Code block
- `/list` - Bullet list
- `/divider` - Horizontal rule

### 🌐 Internationalization (i18n)
- English 🇺🇸
- Spanish 🇪🇸

### 📊 Text Analysis
- Word count
- Character count
- Reading time
- Word density analysis

### 💾 Export Options
- Markdown (.md)
- Plain Text (.txt)
- PDF (.pdf)
- HTML (.html)

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Save (auto-saved) |
| `/` | Open slash menu |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ronaldmendzas/TextOr.git

# Navigate to the project
cd TextOr

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework:** Next.js 15.1.4 (App Router + Turbopack)
- **Language:** TypeScript 5.7 (Strict Mode)
- **Styling:** Tailwind CSS 3.4
- **State Management:** Zustand 5.0 + Immer
- **Icons:** Lucide React
- **PDF Export:** jsPDF
- **AI/Autocorrect:** LanguageTool API (Free)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/
│   ├── editor/          # Editor components
│   │   ├── blocks/      # Block components (Paragraph, Heading, etc.)
│   │   ├── Toolbar.tsx
│   │   ├── SlashMenu.tsx
│   │   └── EmojiPicker.tsx
│   └── ui/              # UI components (Button, etc.)
├── hooks/               # Custom React hooks
├── i18n/                # Translations (en.ts, es.ts)
├── lib/                 # Utilities
│   ├── ai-service.ts    # LanguageTool integration
│   ├── emoji-shortcuts.ts # 400+ emoji mappings
│   ├── export.ts        # Export functions
│   └── text-analysis.ts # Word count, etc.
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ronald Mendzas**

- GitHub: [@ronaldmendzas](https://github.com/ronaldmendzas)

---

Made with ❤️ and ☕
