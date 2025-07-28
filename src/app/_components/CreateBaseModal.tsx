"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/react";

interface CreateBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBaseModal({ isOpen, onClose }: CreateBaseModalProps) {
  const [name, setName] = useState("");
  const utils = api.useUtils();

  const createBase = api.base.create.useMutation({
    onSuccess: async () => {
      await utils.base.getUserBases.invalidate();
      setName("");
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createBase.mutate({ name: name.trim() });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6 border border-slate-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-gray-900">Create new base</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="baseName" className="block text-sm font-light text-gray-700 mb-2">
              Base name
            </label>
            <input
              id="baseName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter base name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createBase.isPending}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-light text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {createBase.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}