export interface TranslationKeys {
  editor: {
    beta: string;
    untitled: string;
    placeholder: string;
  };
  toolbar: {
    undo: string;
    redo: string;
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    code: string;
    link: string;
    focusMode: string;
    wordDensity: string;
  };
  slashMenu: {
    title: string;
    noResults: string;
    commands: {
      paragraph: { label: string; description: string };
      heading1: { label: string; description: string };
      heading2: { label: string; description: string };
      heading3: { label: string; description: string };
      code: { label: string; description: string };
      table: { label: string; description: string };
      calloutInfo: { label: string; description: string };
      calloutWarning: { label: string; description: string };
      calloutTip: { label: string; description: string };
      calloutDanger: { label: string; description: string };
      quote: { label: string; description: string };
      bulletList: { label: string; description: string };
      numberedList: { label: string; description: string };
      checkboxList: { label: string; description: string };
      divider: { label: string; description: string };
      embed: { label: string; description: string };
    };
  };
  blocks: {
    code: {
      run: string;
      running: string;
      output: string;
      language: string;
    };
    table: {
      addColumn: string;
      addRow: string;
      deleteColumn: string;
      deleteRow: string;
    };
    callout: {
      info: string;
      warning: string;
      tip: string;
      danger: string;
    };
    embed: {
      embedPrompt: string;
      yes: string;
      no: string;
      loading: string;
    };
  };
  stats: {
    words: string;
    characters: string;
    sentences: string;
    paragraphs: string;
    readingTime: string;
    wordCount: string;
    sentiment: string;
  };
  save: {
    saved: string;
    saving: string;
  };
  wordDensity: {
    title: string;
    sentiment: string;
    topWords: string;
  };
  common: {
    save: string;
  };
  export: {
    title: string;
    pdf: string;
    markdown: string;
    json: string;
    html: string;
    copied: string;
  };
  language: {
    en: string;
    es: string;
  };
  actions: {
    delete: string;
    duplicate: string;
    moveUp: string;
    moveDown: string;
  };
}

export const en: TranslationKeys = {
  editor: {
    beta: "Beta",
    untitled: "Untitled Document",
    placeholder: "Type '/' for commands or start writing...",
  },
  toolbar: {
    undo: "Undo",
    redo: "Redo",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    code: "Code",
    link: "Link",
    focusMode: "Focus Mode",
    wordDensity: "Word Density",
  },
  slashMenu: {
    title: "Add Block",
    noResults: "No results found",
    commands: {
      paragraph: { label: "Paragraph", description: "Plain text paragraph" },
      heading1: { label: "Heading 1", description: "Large section heading" },
      heading2: { label: "Heading 2", description: "Medium section heading" },
      heading3: { label: "Heading 3", description: "Small section heading" },
      code: { label: "Code Block", description: "Executable code with syntax highlighting" },
      table: { label: "Table", description: "Dynamic sortable table" },
      calloutInfo: { label: "Info Callout", description: "Informational notice" },
      calloutWarning: { label: "Warning Callout", description: "Warning notice" },
      calloutTip: { label: "Tip Callout", description: "Helpful tip" },
      calloutDanger: { label: "Danger Callout", description: "Critical warning" },
      quote: { label: "Quote", description: "Block quotation" },
      bulletList: { label: "Bullet List", description: "Unordered list" },
      numberedList: { label: "Numbered List", description: "Ordered list" },
      checkboxList: { label: "Checkbox List", description: "Task list with checkboxes" },
      divider: { label: "Divider", description: "Visual separator" },
      embed: { label: "Embed", description: "YouTube, Spotify, Twitter embed" },
    },
  },
  blocks: {
    code: {
      run: "Run",
      running: "Running...",
      output: "Output",
      language: "Language",
    },
    table: {
      addColumn: "Add Column",
      addRow: "Add Row",
      deleteColumn: "Delete Column",
      deleteRow: "Delete Row",
    },
    callout: {
      info: "Info",
      warning: "Warning",
      tip: "Tip",
      danger: "Danger",
    },
    embed: {
      embedPrompt: "Would you like to embed this content?",
      yes: "Yes, embed",
      no: "No, keep link",
      loading: "Loading embed...",
    },
  },
  stats: {
    words: "words",
    characters: "characters",
    sentences: "sentences",
    paragraphs: "paragraphs",
    readingTime: "min read",
    wordCount: "Word count",
    sentiment: "Sentiment",
  },
  save: {
    saved: "Saved",
    saving: "Saving...",
  },
  wordDensity: {
    title: "Word Density",
    sentiment: "Sentiment",
    topWords: "Top Words",
  },
  common: {
    save: "Saved",
  },
  export: {
    title: "Export",
    pdf: "Export to PDF",
    markdown: "Export to Markdown",
    json: "Export to JSON",
    html: "Copy as HTML",
    copied: "Copied to clipboard!",
  },
  language: {
    en: "English",
    es: "Spanish",
  },
  actions: {
    delete: "Delete",
    duplicate: "Duplicate",
    moveUp: "Move Up",
    moveDown: "Move Down",
  },
};
