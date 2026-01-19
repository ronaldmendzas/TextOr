"use client";

import { useCallback, useMemo } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block, SortDirection } from "@/types";
import { cn, createTableCell, createTableRow, createTableColumn } from "@/lib";
import { Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface TableBlockProps {
  block: Block<"table">;
}

export function TableBlock({ block }: TableBlockProps) {
  const { t } = useI18n();
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const { columns, rows, sortColumn, sortDirection } = block.data;

  const sortedRows = useMemo(() => {
    if (!sortColumn || sortDirection === "none") {
      return rows;
    }

    const columnIndex = columns.findIndex((col) => col.id === sortColumn);
    if (columnIndex === -1) return rows;

    return [...rows].sort((a, b) => {
      const cellA = a.cells[columnIndex];
      const cellB = b.cells[columnIndex];
      const textA = cellA?.content.map((s) => s.text).join("") ?? "";
      const textB = cellB?.content.map((s) => s.text).join("") ?? "";

      const comparison = textA.localeCompare(textB, undefined, { numeric: true });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rows, columns, sortColumn, sortDirection]);

  const handleCellChange = useCallback(
    (rowId: string, cellIndex: number, text: string) => {
      const newRows = rows.map((row) => {
        if (row.id !== rowId) return row;
        const newCells = [...row.cells];
        const cell = newCells[cellIndex];
        if (cell) {
          newCells[cellIndex] = {
            ...cell,
            content: [{ text }],
          };
        }
        return { ...row, cells: newCells };
      });

      updateBlock<"table">(block.id, { rows: newRows });
    },
    [block.id, rows, updateBlock]
  );

  const handleHeaderChange = useCallback(
    (columnId: string, header: string) => {
      const newColumns = columns.map((col) =>
        col.id === columnId ? { ...col, header } : col
      );
      updateBlock<"table">(block.id, { columns: newColumns });
    },
    [block.id, columns, updateBlock]
  );

  const handleSort = useCallback(
    (columnId: string) => {
      let newDirection: SortDirection = "asc";
      if (sortColumn === columnId) {
        if (sortDirection === "asc") newDirection = "desc";
        else if (sortDirection === "desc") newDirection = "none";
      }

      updateBlock<"table">(block.id, {
        sortColumn: newDirection === "none" ? undefined : columnId,
        sortDirection: newDirection,
      });
    },
    [block.id, sortColumn, sortDirection, updateBlock]
  );

  const handleAddColumn = useCallback(() => {
    pushToHistory("Add table column");
    const newColumn = createTableColumn(`Column ${columns.length + 1}`);
    const newRows = rows.map((row) => ({
      ...row,
      cells: [...row.cells, createTableCell()],
    }));

    updateBlock<"table">(block.id, {
      columns: [...columns, newColumn],
      rows: newRows,
    });
  }, [block.id, columns, rows, updateBlock, pushToHistory]);

  const handleAddRow = useCallback(() => {
    pushToHistory("Add table row");
    const newRow = createTableRow(columns.length);
    updateBlock<"table">(block.id, {
      rows: [...rows, newRow],
    });
  }, [block.id, columns.length, rows, updateBlock, pushToHistory]);

  const handleDeleteColumn = useCallback(
    (columnIndex: number) => {
      if (columns.length <= 1) return;
      pushToHistory("Delete table column");

      const newColumns = columns.filter((_, idx) => idx !== columnIndex);
      const newRows = rows.map((row) => ({
        ...row,
        cells: row.cells.filter((_, idx) => idx !== columnIndex),
      }));

      updateBlock<"table">(block.id, {
        columns: newColumns,
        rows: newRows,
      });
    },
    [block.id, columns, rows, updateBlock, pushToHistory]
  );

  const handleDeleteRow = useCallback(
    (rowId: string) => {
      if (rows.length <= 1) return;
      pushToHistory("Delete table row");

      const newRows = rows.filter((row) => row.id !== rowId);
      updateBlock<"table">(block.id, { rows: newRows });
    },
    [block.id, rows, updateBlock, pushToHistory]
  );

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return <ArrowUpDown className="h-3 w-3" />;
    if (sortDirection === "asc") return <ArrowUp className="h-3 w-3" />;
    if (sortDirection === "desc") return <ArrowDown className="h-3 w-3" />;
    return <ArrowUpDown className="h-3 w-3" />;
  };

  return (
    <div className="dynamic-table overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((column, colIndex) => (
              <th key={column.id} className="group relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={column.header}
                    onChange={(e) =>
                      handleHeaderChange(column.id, e.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                    aria-label={`Column header ${colIndex + 1}`}
                  />
                  <button
                    onClick={() => handleSort(column.id)}
                    className="opacity-50 hover:opacity-100"
                    title="Sort column"
                  >
                    {getSortIcon(column.id)}
                  </button>
                  <button
                    onClick={() => handleDeleteColumn(colIndex)}
                    className="opacity-0 group-hover:opacity-50 hover:opacity-100"
                    disabled={columns.length <= 1}
                    title={t.blocks.table.deleteColumn}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </th>
            ))}
            <th className="w-8 border-none bg-transparent">
              <button
                onClick={handleAddColumn}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-editor-hover"
                title={t.blocks.table.addColumn}
              >
                <Plus className="h-4 w-4 text-editor-muted" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id} className="group">
              {row.cells.map((cell, cellIndex) => (
                <td key={cell.id}>
                  <input
                    type="text"
                    value={cell.content.map((s) => s.text).join("")}
                    onChange={(e) =>
                      handleCellChange(row.id, cellIndex, e.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                    aria-label={`Cell row ${rows.indexOf(row) + 1}, column ${cellIndex + 1}`}
                  />
                </td>
              ))}
              <td className="w-8 border-none">
                <button
                  onClick={() => handleDeleteRow(row.id)}
                  className="flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-50 hover:opacity-100"
                  disabled={rows.length <= 1}
                  title={t.blocks.table.deleteRow}
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleAddRow}
        className={cn(
          "mt-2 flex w-full items-center justify-center gap-1 py-2",
          "text-sm text-editor-muted hover:bg-editor-hover",
          "rounded-b-lg transition-colors duration-150"
        )}
      >
        <Plus className="h-4 w-4" />
        <span>{t.blocks.table.addRow}</span>
      </button>
    </div>
  );
}
