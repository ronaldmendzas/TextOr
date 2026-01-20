"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "@/stores";
import { cn } from "@/lib";
import { Search, Replace, X, ChevronDown, ChevronUp, CaseSensitive, WholeWord } from "lucide-react";

interface Match {
  blockId: string;
  index: number;
  length: number;
}

export function FindReplace() {
  const [isOpen, setIsOpen] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  const findInputRef = useRef<HTMLInputElement>(null);
  const document = useEditorStore((state) => state.document);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsOpen(true);
        setShowReplace(false);
        setTimeout(() => findInputRef.current?.focus(), 50);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setIsOpen(true);
        setShowReplace(true);
        setTimeout(() => findInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        clearHighlights();
      }
      if (e.key === "Enter" && isOpen && matches.length > 0) {
        e.preventDefault();
        goToNextMatch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, matches.length]);

  const getBlockText = useCallback((block: typeof document.blocks[0]): string => {
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote" || block.type === "callout") {
      const data = block.data as { content?: { text: string }[] };
      return data.content?.map((s) => s.text).join("") ?? "";
    }
    if (block.type === "code") {
      return (block.data as { code: string }).code;
    }
    if (block.type === "list") {
      const data = block.data as { items: { content: { text: string }[] }[] };
      return data.items.map((item) => item.content.map((s) => s.text).join("")).join("\n");
    }
    return "";
  }, []);

  const search = useCallback(() => {
    if (!findQuery.trim()) {
      setMatches([]);
      clearHighlights();
      return;
    }

    const newMatches: Match[] = [];
    const flags = caseSensitive ? "g" : "gi";
    const pattern = wholeWord ? `\\b${escapeRegex(findQuery)}\\b` : escapeRegex(findQuery);
    const regex = new RegExp(pattern, flags);

    document.blocks.forEach((block) => {
      const text = getBlockText(block);
      let match;
      while ((match = regex.exec(text)) !== null) {
        newMatches.push({
          blockId: block.id,
          index: match.index,
          length: match[0].length,
        });
      }
    });

    setMatches(newMatches);
    setCurrentMatch(newMatches.length > 0 ? 0 : -1);
    highlightMatches(newMatches);
  }, [findQuery, caseSensitive, wholeWord, document.blocks, getBlockText]);

  useEffect(() => {
    const debounce = setTimeout(search, 200);
    return () => clearTimeout(debounce);
  }, [search]);

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightMatches = useCallback((matchList: Match[]) => {
    clearHighlights();
    matchList.forEach((match, idx) => {
      const blockEl = window.document.querySelector(`[data-block-id="${match.blockId}"]`);
      if (!blockEl) return;

      const walker = window.document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
      let charCount = 0;
      let node;

      while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const nodeLength = textNode.length;

        if (charCount + nodeLength > match.index && charCount <= match.index) {
          const startOffset = match.index - charCount;
          const endOffset = Math.min(startOffset + match.length, nodeLength);

          try {
            const range = window.document.createRange();
            range.setStart(textNode, startOffset);
            range.setEnd(textNode, endOffset);

            const highlight = window.document.createElement("mark");
            highlight.className = cn(
              "textor-find-highlight",
              idx === currentMatch && "textor-find-current"
            );
            range.surroundContents(highlight);
          } catch {
            // Skip invalid ranges
          }
          break;
        }
        charCount += nodeLength;
      }
    });
  }, [currentMatch]);

  const clearHighlights = () => {
    window.document.querySelectorAll(".textor-find-highlight").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(window.document.createTextNode(el.textContent ?? ""), el);
        parent.normalize();
      }
    });
  };

  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const next = (currentMatch + 1) % matches.length;
    setCurrentMatch(next);
    const match = matches[next];
    if (match) scrollToMatch(match);
  }, [matches, currentMatch]);

  const goToPrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prev = (currentMatch - 1 + matches.length) % matches.length;
    setCurrentMatch(prev);
    const match = matches[prev];
    if (match) scrollToMatch(match);
  }, [matches, currentMatch]);

  const scrollToMatch = (match: Match) => {
    const blockEl = window.document.querySelector(`[data-block-id="${match.blockId}"]`);
    blockEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const replaceOne = useCallback(() => {
    if (matches.length === 0 || currentMatch < 0) return;

    const match = matches[currentMatch];
    if (!match) return;

    const block = document.blocks.find((b) => b.id === match.blockId);
    if (!block) return;

    pushToHistory("Replace text");
    const text = getBlockText(block);
    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match.length);
    const newText = before + replaceQuery + after;

    updateBlockText(block, newText);
    search();
  }, [matches, currentMatch, replaceQuery, document.blocks, getBlockText, pushToHistory]);

  const replaceAll = useCallback(() => {
    if (matches.length === 0) return;

    pushToHistory("Replace all");

    const blockChanges = new Map<string, string>();
    document.blocks.forEach((block) => {
      let text = getBlockText(block);
      if (!text) return;

      const flags = caseSensitive ? "g" : "gi";
      const pattern = wholeWord ? `\\b${escapeRegex(findQuery)}\\b` : escapeRegex(findQuery);
      const regex = new RegExp(pattern, flags);

      if (regex.test(text)) {
        blockChanges.set(block.id, text.replace(new RegExp(pattern, flags), replaceQuery));
      }
    });

    blockChanges.forEach((newText, blockId) => {
      const block = document.blocks.find((b) => b.id === blockId);
      if (block) updateBlockText(block, newText);
    });

    search();
  }, [matches, findQuery, replaceQuery, caseSensitive, wholeWord, document.blocks, getBlockText, pushToHistory]);

  const updateBlockText = (block: typeof document.blocks[0], newText: string) => {
    if (block.type === "paragraph") {
      updateBlock<"paragraph">(block.id, { content: [{ text: newText }] });
    } else if (block.type === "heading") {
      updateBlock<"heading">(block.id, { content: [{ text: newText }] });
    } else if (block.type === "quote") {
      updateBlock<"quote">(block.id, { content: [{ text: newText }] });
    } else if (block.type === "callout") {
      updateBlock<"callout">(block.id, { content: [{ text: newText }] });
    } else if (block.type === "code") {
      updateBlock<"code">(block.id, { code: newText });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    clearHighlights();
    setMatches([]);
    setFindQuery("");
    setReplaceQuery("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-4 top-16 z-50 w-80 rounded-lg border border-editor-border bg-editor-bg p-3 shadow-xl",
        "animate-in fade-in slide-in-from-top-2 duration-200"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-editor-muted" />
          <span className="text-sm font-medium text-editor-text">
            {showReplace ? "Find & Replace" : "Find"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="p-1 hover:bg-editor-hover rounded"
            title={showReplace ? "Hide Replace" : "Show Replace"}
          >
            <Replace className="h-4 w-4 text-editor-muted" />
          </button>
          <button onClick={handleClose} className="p-1 hover:bg-editor-hover rounded" title="Close">
            <X className="h-4 w-4 text-editor-muted" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={findInputRef}
            type="text"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Find..."
            className={cn(
              "flex-1 rounded border border-editor-border bg-editor-hover px-2 py-1.5 text-sm",
              "focus:border-editor-accent focus:outline-none focus:ring-1 focus:ring-editor-accent"
            )}
          />
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={cn(
              "p-1.5 rounded",
              caseSensitive ? "bg-editor-accent text-white" : "hover:bg-editor-hover"
            )}
            title="Case Sensitive"
          >
            <CaseSensitive className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={cn(
              "p-1.5 rounded",
              wholeWord ? "bg-editor-accent text-white" : "hover:bg-editor-hover"
            )}
            title="Whole Word"
          >
            <WholeWord className="h-4 w-4" />
          </button>
        </div>

        {showReplace && (
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace with..."
            className={cn(
              "w-full rounded border border-editor-border bg-editor-hover px-2 py-1.5 text-sm",
              "focus:border-editor-accent focus:outline-none focus:ring-1 focus:ring-editor-accent"
            )}
          />
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-editor-muted">
            {matches.length > 0
              ? `${currentMatch + 1} of ${matches.length} matches`
              : findQuery
              ? "No matches"
              : "Type to search"}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMatch}
              disabled={matches.length === 0}
              className="p-1 hover:bg-editor-hover rounded disabled:opacity-30"
              title="Previous match"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextMatch}
              disabled={matches.length === 0}
              className="p-1 hover:bg-editor-hover rounded disabled:opacity-30"
              title="Next match"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showReplace && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={replaceOne}
              disabled={matches.length === 0}
              className={cn(
                "flex-1 rounded bg-editor-accent px-3 py-1.5 text-sm text-white",
                "hover:opacity-90 disabled:opacity-30"
              )}
            >
              Replace
            </button>
            <button
              onClick={replaceAll}
              disabled={matches.length === 0}
              className={cn(
                "flex-1 rounded border border-editor-accent px-3 py-1.5 text-sm text-editor-accent",
                "hover:bg-editor-accent hover:text-white disabled:opacity-30"
              )}
            >
              Replace All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
