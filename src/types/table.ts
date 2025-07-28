export interface Table {
  id: string;
  name: string;
  baseId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  columns?: Column[];
  rows?: Row[];
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  order: number;
  tableId: string;
  createdAt: Date;
  updatedAt: Date;
  cells?: Cell[];
}

export interface Row {
  id: string;
  name?: string | null;
  order: number;
  tableId: string;
  createdAt: Date;
  updatedAt: Date;
  cells?: Cell[];
}

export interface Cell {
  id: string;
  value?: string | null;
  columnId: string;
  rowId: string;
  createdAt: Date;
  updatedAt: Date;
  column?: Column;
}

export enum ColumnType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
}