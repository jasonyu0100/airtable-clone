"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ColumnType } from "~/types/table";

interface CreateFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateField: (name: string, type: ColumnType) => void;
  isCreating?: boolean;
}

export function CreateFieldModal({ isOpen, onClose, onCreateField, isCreating }: CreateFieldModalProps) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<ColumnType>(ColumnType.TEXT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldName.trim()) {
      onCreateField(fieldName.trim(), fieldType);
      setFieldName("");
      setFieldType(ColumnType.TEXT);
    }
  };

  const handleClose = () => {
    setFieldName("");
    setFieldType(ColumnType.TEXT);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6 border border-slate-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-gray-900">Create field</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700 mb-2">
              Field name
            </label>
            <input
              id="fieldName"
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Enter field name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="fieldType" className="block text-sm font-medium text-gray-700 mb-2">
              Field type
            </label>
            <select
              id="fieldType"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as ColumnType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={ColumnType.TEXT}>Text</option>
              <option value={ColumnType.NUMBER}>Number</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!fieldName.trim() || isCreating}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create field"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}