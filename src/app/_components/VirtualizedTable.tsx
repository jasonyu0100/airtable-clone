"use client";

import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState, useEffect } from "react";
import { api } from "~/trpc/react";
import type { Column, Row, Cell, ColumnType } from "~/types/table";
import { CreateFieldModal } from "./CreateFieldModal";

interface TableData {
  [key: string]: string | undefined;
}

interface VirtualizedTableProps {
  tableId: string;
}

const columnHelper = createColumnHelper<TableData>();

export function VirtualizedTable({ tableId }: VirtualizedTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string; type: 'field' | 'name' } | null>(null);
  const [cellValue, setCellValue] = useState("");
  const [draftValues, setDraftValues] = useState<Map<string, string>>(new Map());
  const [showCreateFieldModal, setShowCreateFieldModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const utils = api.useUtils();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Helper functions for draft state management
  const getDraftValue = (key: string, fallback: string) => {
    return draftValues.get(key) ?? fallback;
  };

  const setDraftValue = (key: string, value: string) => {
    setDraftValues(prev => new Map(prev.set(key, value)));
  };

  const clearDraftValue = (key: string) => {
    setDraftValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  // Fetch table data
  const { data: tableData } = api.table.getById.useQuery({ id: tableId });
  const { data: rowsData, fetchNextPage, hasNextPage } = api.row.getByTableId.useInfiniteQuery(
    { tableId, limit: 50 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Mutations
  const createColumn = api.column.create.useMutation({
    onSuccess: () => {
      utils.table.getById.invalidate({ id: tableId });
      setShowCreateFieldModal(false);
    },
  });

  const handleCreateField = (name: string, type: ColumnType) => {
    createColumn.mutate({
      name,
      type,
      tableId,
    });
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === allRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(allRows.map(row => row.id)));
    }
  };

  const createRow = api.row.create.useMutation({
    onSuccess: () => {
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const updateCell = api.row.updateCell.useMutation({
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await utils.row.getByTableId.cancel({ tableId });
      
      // Snapshot the previous value
      const previousData = utils.row.getByTableId.getInfiniteData({ tableId });
      
      // Optimistically update to the new value
      utils.row.getByTableId.setInfiniteData({ tableId }, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.map(row => {
              if (row.id === newData.rowId) {
                return {
                  ...row,
                  cells: row.cells?.map(cell => 
                    cell.columnId === newData.columnId 
                      ? { ...cell, value: newData.value }
                      : cell
                  ) || []
                };
              }
              return row;
            })
          }))
        };
      });
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        utils.row.getByTableId.setInfiniteData({ tableId }, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  const updateRowName = api.row.updateName.useMutation({
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await utils.row.getByTableId.cancel({ tableId });
      
      // Snapshot the previous value
      const previousData = utils.row.getByTableId.getInfiniteData({ tableId });
      
      // Optimistically update to the new value
      utils.row.getByTableId.setInfiniteData({ tableId }, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.map(row => {
              if (row.id === newData.id) {
                return {
                  ...row,
                  name: newData.name
                };
              }
              return row;
            })
          }))
        };
      });
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        utils.row.getByTableId.setInfiniteData({ tableId }, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.row.getByTableId.invalidate({ tableId });
    },
  });

  // Flatten all rows from infinite query
  const allRows = useMemo(() => {
    return rowsData?.pages.flatMap((page) => page.items) ?? [];
  }, [rowsData]);

  // Clean up draft values when server data matches
  useEffect(() => {
    if (!allRows.length || !tableData?.columns) return;

    const keysToDelete: string[] = [];
    
    draftValues.forEach((draftValue, key) => {
      if (key.endsWith('-name')) {
        // Handle row names
        const rowId = key.replace('-name', '');
        const row = allRows.find(r => r.id === rowId);
        if (row && (row.name || '') === draftValue) {
          keysToDelete.push(key);
        }
      } else {
        // Handle cell values
        const [rowId, columnId] = key.split('-');
        const row = allRows.find(r => r.id === rowId);
        if (row) {
          const cell = row.cells?.find(c => c.columnId === columnId);
          if ((cell?.value || '') === draftValue) {
            keysToDelete.push(key);
          }
        }
      }
    });

    // Clear draft values that match server values
    if (keysToDelete.length > 0) {
      setDraftValues(prev => {
        const newMap = new Map(prev);
        keysToDelete.forEach(key => newMap.delete(key));
        return newMap;
      });
    }
  }, [allRows, tableData?.columns, draftValues]);

  // Prepare data for TanStack Table
  const columns = useMemo(() => {
    if (!tableData?.columns) return [];

    const cols: ColumnDef<TableData>[] = tableData.columns.map((column) =>
      columnHelper.accessor(column.id, {
        id: column.id,
        header: () => (
          <div className="flex items-center justify-between group">
            <span className="font-medium text-gray-700">{column.name}</span>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ getValue, row: { index }, column: { id } }) => {
          const serverValue = getValue() as string;
          const rowId = allRows[index]?.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === id && editingCell?.type === 'field';
          const cellKey = `${rowId}-${id}`;
          
          // Always show draft value if it exists, otherwise show server value
          const displayValue = getDraftValue(cellKey, serverValue || "");
          
          return (
            <div className="relative">
              {isEditing ? (
                <input
                  type={column.type === "NUMBER" ? "number" : "text"}
                  value={cellValue}
                  onChange={(e) => {
                    setCellValue(e.target.value);
                    // Update draft state in real-time as user types
                    if (rowId) {
                      setDraftValue(cellKey, e.target.value);
                    }
                  }}
                  onBlur={() => {
                    if (rowId && cellValue !== (serverValue || "")) {
                      updateCell.mutate({
                        rowId,
                        columnId: id,
                        value: cellValue,
                      });
                    }
                    setEditingCell(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && rowId && cellValue !== (serverValue || "")) {
                      updateCell.mutate({
                        rowId,
                        columnId: id,
                        value: cellValue,
                      });
                      setEditingCell(null);
                    }
                    if (e.key === "Escape") {
                      // Revert to server value on escape
                      if (rowId) {
                        clearDraftValue(cellKey);
                      }
                      setEditingCell(null);
                    }
                  }}
                  className="w-full h-full px-3 py-2 text-sm border-2 border-blue-500 rounded-sm focus:outline-none"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => {
                    if (rowId) {
                      setEditingCell({ rowId, columnId: id, type: 'field' });
                      setCellValue(displayValue);
                    }
                  }}
                  className="w-full h-full px-3 py-2 text-sm cursor-cell hover:bg-blue-50 min-h-[36px] flex items-center"
                >
                  {displayValue || (
                    <span className="text-gray-400">
                      {column.type === "NUMBER" ? "0" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },
      })
    );

    // Add select/row number column
    const selectCol = columnHelper.display({
      id: "select",
      header: () => (
        <div className="w-full h-full flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedRows.size === allRows.length && allRows.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
      cell: ({ row: { index } }) => {
        const rowData = allRows[index];
        const isSelected = rowData ? selectedRows.has(rowData.id) : false;
        const isHovered = rowData ? hoveredRow === rowData.id : false;
        const showCheckbox = isSelected || isHovered;
        
        return (
          <div 
            className="w-full h-full flex items-center justify-center group"
            onMouseEnter={() => rowData && setHoveredRow(rowData.id)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            {showCheckbox ? (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => rowData && toggleRowSelection(rowData.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            ) : (
              <span className="text-xs text-gray-500 select-none">{index + 1}</span>
            )}
          </div>
        );
      },
    });

    // Add row name column
    const rowNameCol = columnHelper.display({
      id: "row-name",
      header: () => (
        <div className="flex items-center justify-between group">
          <span className="font-medium text-gray-700">Name</span>
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row: { index } }) => {
        const rowData = allRows[index];
        const isEditing = editingCell?.rowId === rowData?.id && editingCell?.type === 'name';
        const nameKey = `${rowData?.id}-name`;
        
        // Always show draft value if it exists, otherwise show server value
        const displayName = getDraftValue(nameKey, rowData?.name || "");
        
        return (
          <div className="w-full h-full relative">
            {isEditing ? (
              <input
                type="text"
                value={cellValue}
                onChange={(e) => {
                  setCellValue(e.target.value);
                  // Update draft state in real-time as user types
                  if (rowData) {
                    setDraftValue(nameKey, e.target.value);
                  }
                }}
                onBlur={() => {
                  if (rowData && cellValue !== (rowData.name || "")) {
                    updateRowName.mutate({
                      id: rowData.id,
                      name: cellValue || undefined,
                    });
                  }
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rowData && cellValue !== (rowData.name || "")) {
                    updateRowName.mutate({
                      id: rowData.id,
                      name: cellValue || undefined,
                    });
                    setEditingCell(null);
                  }
                  if (e.key === "Escape") {
                    // Revert to server value on escape
                    if (rowData) {
                      clearDraftValue(nameKey);
                    }
                    setEditingCell(null);
                  }
                }}
                className="w-full h-full px-2 py-1 text-xs border-2 border-blue-500 rounded-sm focus:outline-none bg-white"
                autoFocus
              />
            ) : (
              <div
                onClick={() => {
                  if (rowData) {
                    setEditingCell({ rowId: rowData.id, columnId: "", type: 'name' });
                    setCellValue(displayName);
                  }
                }}
                className="w-full h-full px-2 py-1 text-xs cursor-cell hover:bg-blue-50 min-h-[36px] flex items-center text-gray-700"
              >
                {displayName}
              </div>
            )}
          </div>
        );
      },
    });

    // Add "Add Column" column
    const addColumnCol = columnHelper.display({
      id: "add-column",
      header: () => (
        <button
          onClick={() => setShowCreateFieldModal(true)}
          className="flex items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Add field"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      ),
      cell: () => (
        <div className="w-full h-full bg-gray-50" />
      ),
    });

    return [selectCol, rowNameCol, ...cols, addColumnCol];
  }, [tableData?.columns, updateCell, updateRowName, editingCell, cellValue, allRows, selectedRows, hoveredRow, toggleSelectAll, toggleRowSelection, getDraftValue, setDraftValue, clearDraftValue]);

  // Transform data for table
  const tableDataFormatted = useMemo(() => {
    return allRows.map((row) => {
      const rowData: TableData = { id: row.id };
      row.cells?.forEach((cell) => {
        if (cell.column) {
          rowData[cell.column.id] = cell.value || "";
        }
      });
      return rowData;
    });
  }, [allRows]);

  const table = useReactTable({
    data: tableDataFormatted,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Virtualization
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });


  if (!tableData) {
    return <div className="p-4">Loading table...</div>;
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Airtable-style Table */}
      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto border border-gray-200"
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize() + 40}px`, position: "relative" }}>
          {/* Table Header */}
          <div className="sticky top-0 z-10 flex bg-gray-50 border-b-2 border-gray-200">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header, index) => (
                <div
                  key={header.id}
                  className={`px-0 h-10 flex items-center ${
                    header.id === "select" 
                      ? "w-16" 
                      : header.id === "row-name" 
                      ? "w-24" 
                      : header.id === "add-column" 
                      ? "w-12 bg-gray-100 border-l border-gray-200" 
                      : "flex-1 min-w-[150px] border-l border-gray-200"
                  }`}
                  style={{ 
                    minWidth: header.id === "select" ? "64px" : header.id === "row-name" ? "96px" : header.id === "add-column" ? "48px" : "150px" 
                  }}
                >
                  <div className="w-full h-full flex items-center px-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Virtualized Rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]!;
            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  top: 40, // Account for header height
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex border-b border-gray-200 hover:bg-blue-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className={`${
                      cell.column.id === "select"
                        ? "w-16"
                        : cell.column.id === "row-name"
                        ? "w-24"
                        : cell.column.id === "add-column" 
                        ? "w-12 bg-gray-50 border-l border-gray-200" 
                        : "flex-1 min-w-[150px] border-l border-gray-200"
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Add Row Button */}
          <div
            style={{
              position: "absolute",
              top: 40 + rowVirtualizer.getTotalSize(),
              left: 0,
              width: "100%",
              height: "40px",
            }}
            className="flex border-b border-gray-200 bg-gray-50"
          >
            {/* Add row button in select/row number column */}
            <button
              onClick={() => createRow.mutate({ tableId })}
              className="flex items-center justify-center w-16 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Add row"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            {/* Empty space for name column */}
            <div className="w-24" />
            <div className="flex-1 bg-gray-50" />
          </div>
        </div>

        {/* Load more trigger */}
        {hasNextPage && (
          <div className="p-4 text-center bg-white">
            <button
              onClick={() => fetchNextPage()}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Load more rows
            </button>
          </div>
        )}
      </div>

      {/* Create Field Modal */}
      <CreateFieldModal
        isOpen={showCreateFieldModal}
        onClose={() => setShowCreateFieldModal(false)}
        onCreateField={handleCreateField}
        isCreating={createColumn.isPending}
      />
    </div>
  );
}