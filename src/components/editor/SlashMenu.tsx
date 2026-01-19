"use client";

import { useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import { cn } from "@/lib";
import type { SlashCommand } from "@/types";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Table,
  Info,
  AlertTriangle,
  Lightbulb,
  AlertOctagon,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Video,
} from "lucide-react";

export function SlashMenu() {
  const { t } = useI18n();
  const slashMenu = useEditorStore((state) => state.slashMenu);
  const closeSlashMenu = useEditorStore((state) => state.closeSlashMenu);
  const addBlock = useEditorStore((state) => state.addBlock);
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const setSlashMenuSelectedIndex = useEditorStore(
    (state) => state.setSlashMenuSelectedIndex
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const commands: SlashCommand[] = useMemo(
    () => [
      {
        id: "paragraph",
        label: t.slashMenu.commands.paragraph.label,
        description: t.slashMenu.commands.paragraph.description,
        icon: "Type",
        keywords: ["paragraph", "text", "p", "párrafo"],
        blockType: "paragraph",
      },
      {
        id: "heading1",
        label: t.slashMenu.commands.heading1.label,
        description: t.slashMenu.commands.heading1.description,
        icon: "Heading1",
        keywords: ["heading", "h1", "title", "encabezado", "título"],
        blockType: "heading",
      },
      {
        id: "heading2",
        label: t.slashMenu.commands.heading2.label,
        description: t.slashMenu.commands.heading2.description,
        icon: "Heading2",
        keywords: ["heading", "h2", "subtitle", "encabezado", "subtítulo"],
        blockType: "heading",
      },
      {
        id: "heading3",
        label: t.slashMenu.commands.heading3.label,
        description: t.slashMenu.commands.heading3.description,
        icon: "Heading3",
        keywords: ["heading", "h3", "encabezado"],
        blockType: "heading",
      },
      {
        id: "code",
        label: t.slashMenu.commands.code.label,
        description: t.slashMenu.commands.code.description,
        icon: "Code2",
        keywords: ["code", "javascript", "python", "código", "programación"],
        blockType: "code",
      },
      {
        id: "table",
        label: t.slashMenu.commands.table.label,
        description: t.slashMenu.commands.table.description,
        icon: "Table",
        keywords: ["table", "grid", "tabla", "columnas"],
        blockType: "table",
      },
      {
        id: "callout-info",
        label: t.slashMenu.commands.calloutInfo.label,
        description: t.slashMenu.commands.calloutInfo.description,
        icon: "Info",
        keywords: ["callout", "info", "notice", "información", "aviso"],
        blockType: "callout",
      },
      {
        id: "callout-warning",
        label: t.slashMenu.commands.calloutWarning.label,
        description: t.slashMenu.commands.calloutWarning.description,
        icon: "AlertTriangle",
        keywords: ["callout", "warning", "alert", "advertencia", "alerta"],
        blockType: "callout",
      },
      {
        id: "callout-tip",
        label: t.slashMenu.commands.calloutTip.label,
        description: t.slashMenu.commands.calloutTip.description,
        icon: "Lightbulb",
        keywords: ["callout", "tip", "hint", "consejo", "sugerencia"],
        blockType: "callout",
      },
      {
        id: "callout-danger",
        label: t.slashMenu.commands.calloutDanger.label,
        description: t.slashMenu.commands.calloutDanger.description,
        icon: "AlertOctagon",
        keywords: ["callout", "danger", "error", "peligro", "crítico"],
        blockType: "callout",
      },
      {
        id: "quote",
        label: t.slashMenu.commands.quote.label,
        description: t.slashMenu.commands.quote.description,
        icon: "Quote",
        keywords: ["quote", "blockquote", "cita", "frase"],
        blockType: "quote",
      },
      {
        id: "bullet-list",
        label: t.slashMenu.commands.bulletList.label,
        description: t.slashMenu.commands.bulletList.description,
        icon: "List",
        keywords: ["list", "bullet", "unordered", "lista", "viñetas"],
        blockType: "list",
      },
      {
        id: "numbered-list",
        label: t.slashMenu.commands.numberedList.label,
        description: t.slashMenu.commands.numberedList.description,
        icon: "ListOrdered",
        keywords: ["list", "numbered", "ordered", "lista", "numerada"],
        blockType: "list",
      },
      {
        id: "checkbox-list",
        label: t.slashMenu.commands.checkboxList.label,
        description: t.slashMenu.commands.checkboxList.description,
        icon: "CheckSquare",
        keywords: ["list", "checkbox", "todo", "task", "tareas"],
        blockType: "list",
      },
      {
        id: "divider",
        label: t.slashMenu.commands.divider.label,
        description: t.slashMenu.commands.divider.description,
        icon: "Minus",
        keywords: ["divider", "separator", "hr", "divisor", "separador"],
        blockType: "divider",
      },
      {
        id: "embed",
        label: t.slashMenu.commands.embed.label,
        description: t.slashMenu.commands.embed.description,
        icon: "Video",
        keywords: ["embed", "youtube", "video", "spotify", "twitter", "insertar"],
        blockType: "embed",
      },
    ],
    [t]
  );

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Type,
      Heading1,
      Heading2,
      Heading3,
      Code2,
      Table,
      Info,
      AlertTriangle,
      Lightbulb,
      AlertOctagon,
      Quote,
      List,
      ListOrdered,
      CheckSquare,
      Minus,
      Video,
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  const filteredCommands = useMemo(() => {
    if (!slashMenu.query) return commands;
    const query = slashMenu.query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.keywords.some((kw) => kw.includes(query))
    );
  }, [commands, slashMenu.query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!slashMenu.isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSlashMenuSelectedIndex(
            (slashMenu.selectedIndex + 1) % filteredCommands.length
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSlashMenuSelectedIndex(
            slashMenu.selectedIndex === 0
              ? filteredCommands.length - 1
              : slashMenu.selectedIndex - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          const selectedCommand = filteredCommands[slashMenu.selectedIndex];
          if (selectedCommand) {
            handleCommandSelect(selectedCommand);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeSlashMenu();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slashMenu, filteredCommands, setSlashMenuSelectedIndex, closeSlashMenu]);

  const handleCommandSelect = (command: SlashCommand) => {
    if (slashMenu.triggerBlockId) {
      deleteBlock(slashMenu.triggerBlockId);
    }
    addBlock(command.blockType);
    closeSlashMenu();
  };

  if (!slashMenu.isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="slash-menu"
      style={{
        top: slashMenu.position.y,
        left: slashMenu.position.x,
      }}
      role="listbox"
      aria-label={t.slashMenu.title}
    >
      <div className="mb-2 px-3 py-1 text-xs font-semibold text-editor-muted">
        {t.slashMenu.title}
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-editor-muted">
            {t.slashMenu.noResults}
          </div>
        ) : (
          filteredCommands.map((command, index) => (
            <div
              key={command.id}
              className={cn(
                "slash-menu-item",
                index === slashMenu.selectedIndex && "selected"
              )}
              onClick={() => handleCommandSelect(command)}
              role="option"
              aria-selected={index === slashMenu.selectedIndex}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-editor-hover text-editor-muted">
                {getIcon(command.icon)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{command.label}</span>
                <span className="text-xs text-editor-muted">
                  {command.description}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );
}
