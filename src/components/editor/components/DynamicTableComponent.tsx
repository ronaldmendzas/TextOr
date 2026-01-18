'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export function DynamicTableComponent({
  node,
  updateAttributes,
}: {
  node: { attrs: { headers: string[]; rows: string[][] } };
  updateAttributes: (attrs: { headers?: string[]; rows?: string[][] }) => void;
}) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const addColumn = () => {
    const newHeaders = [...node.attrs.headers, `Column ${node.attrs.headers.length + 1}`];
    const newRows = node.attrs.rows.map(row => [...row, '']);
    updateAttributes({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = Array(node.attrs.headers.length).fill('');
    updateAttributes({ rows: [...node.attrs.rows, newRow] });
  };

  const removeColumn = (colIndex: number) => {
    if (node.attrs.headers.length <= 1) return;
    const newHeaders = node.attrs.headers.filter((_, i) => i !== colIndex);
    const newRows = node.attrs.rows.map(row => row.filter((_, i) => i !== colIndex));
    updateAttributes({ headers: newHeaders, rows: newRows });
  };

  const removeRow = (rowIndex: number) => {
    if (node.attrs.rows.length <= 1) return;
    const newRows = node.attrs.rows.filter((_, i) => i !== rowIndex);
    updateAttributes({ rows: newRows });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = node.attrs.rows.map((row, rIdx) =>
      rIdx === rowIndex ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell)) : row
    );
    updateAttributes({ rows: newRows });
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = node.attrs.headers.map((header, idx) =>
      idx === colIndex ? value : header
    );
    updateAttributes({ headers: newHeaders });
  };

  const sortByColumn = (colIndex: number) => {
    const direction = sortColumn === colIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(colIndex);
    setSortDirection(direction);

    const sortedRows = [...node.attrs.rows].sort((a, b) => {
      const aVal = a[colIndex];
      const bVal = b[colIndex];
      const comparison = aVal.localeCompare(bVal);
      return direction === 'asc' ? comparison : -comparison;
    });

    updateAttributes({ rows: sortedRows });
  };

  return (
    <NodeViewWrapper className="dynamic-table-wrapper">
      <div className="my-4 overflow-x-auto">
        <div className="inline-block min-w-full border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {node.attrs.headers.map((header, colIndex) => (
                  <th
                    key={colIndex}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={header}
                        onChange={e => updateHeader(colIndex, e.target.value)}
                        className="bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                        aria-label={`Column header ${colIndex + 1}`}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => sortByColumn(colIndex)}
                          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Sort column"
                        >
                          {sortColumn === colIndex ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUp className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                        {node.attrs.headers.length > 1 && (
                          <button
                            onClick={() => removeColumn(colIndex)}
                            className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove column"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-3 w-10">
                  <button
                    onClick={addColumn}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Add column"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {node.attrs.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      <input
                        type="text"
                        value={cell}
                        onChange={e => updateCell(rowIndex, colIndex, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}`}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 w-10">
                    {node.attrs.rows.length > 1 && (
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove row"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <button
              onClick={addRow}
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
            >
              <Plus className="w-4 h-4" />
              Add row
            </button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
