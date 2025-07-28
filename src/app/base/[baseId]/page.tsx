"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { VirtualizedTable } from "~/app/_components/VirtualizedTable";
import { api } from "~/trpc/react";

interface BasePageProps {
  params: Promise<{
    baseId: string;
  }>;
}

export default function BasePage({ params }: BasePageProps) {
  const router = useRouter();
  const { baseId } = use(params);
  const [activeTab, setActiveTab] = useState("table1");

  // Fetch base data to get the base name
  const { data: bases } = api.base.getUserBases.useQuery();
  const currentBase = bases?.find((base) => base.id === baseId);

  // Fetch tables for this base
  const { data: tables = [] } = api.table.getByBaseId.useQuery({ baseId });

  // Create table mutation
  const utils = api.useUtils();
  const createTable = api.table.create.useMutation({
    onSuccess: () => {
      utils.table.getByBaseId.invalidate({ baseId });
    },
  });

  // Set active tab to first table if available and no tab is selected
  const firstTableId = tables[0]?.id;
  if (firstTableId && activeTab === "table1" && tables.length > 0) {
    setActiveTab(firstTableId);
  }

  const handleCreateTable = () => {
    const tableName = `Table ${tables.length + 1}`;
    createTable.mutate({ name: tableName, baseId });
  };

  return (
    <div className="flex h-screen flex-row bg-white text-gray-900">
      {/* Header */}
      <div className="flex h-full w-16 justify-center border-r border-slate-300 py-2">
        <a
          href="/"
          className="flex h-12 w-12 items-center justify-center rounded-md p-1 transition hover:bg-gray-100"
          title="Go to home"
        >
          <Image
            src="/logo.png"
            alt="Airtable Clone Logo"
            width={40}
            height={40}
            className="h-8 w-8"
          />
        </a>
      </div>
      <div className="flex h-full flex-1 flex-col">
        {/* Header area */}
        <div className="flex h-16 w-full items-center border-b border-slate-300 px-3">
          <h1 className="text-2xl font-light text-gray-900">
            {currentBase?.name || "Loading..."}
          </h1>
        </div>

        {/* Tabs section */}
        <div className="flex h-24 w-full flex-col border-b border-slate-300">
          {/* Tab navigation */}
          <div className="relative flex h-8 w-full bg-green-100">
            {tables.map((table, index) => (
              <button
                key={table.id}
                onClick={() => setActiveTab(table.id)}
                className={`relative px-4 text-sm font-medium transition-colors ${
                  activeTab === table.id
                    ? `rounded-t-md border-t border-r border-b-0 border-slate-300 bg-white text-gray-900 ${index > 0 ? "border-l border-slate-300" : ""}`
                    : "border-b border-slate-300 bg-green-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                {table.name}
                {/* Half-height divider positioned absolutely to not interfere with border */}
                {index < tables.length - 1 &&
                  activeTab !== table.id &&
                  activeTab !== tables[index + 1]?.id && (
                    <div className="absolute top-2 -right-px h-4 w-px bg-slate-300"></div>
                  )}
              </button>
            ))}
            {/* Plus button for adding new tables */}
            <button
              onClick={handleCreateTable}
              disabled={createTable.isPending}
              className="flex items-center gap-2 border-b border-slate-300 px-4 text-gray-600 transition-colors hover:bg-green-200 hover:text-gray-900 disabled:opacity-50"
              title="Add new table"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {createTable.isPending ? "Adding..." : "Add"}
              </span>
            </button>
            {/* Fill remaining space with border */}
            <div className="flex-1 border-b border-slate-300"></div>
          </div>

          {/* Tab content area header */}
          <div className="h-14 w-full">
            <div className="flex h-full flex-1 items-center justify-end px-4">
              <button className="cursor-pointer">Create 100K rows</button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 bg-white">
          {tables.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-lg font-light">No tables yet</div>
                <div className="text-sm">
                  Click "Add" to create your first table
                </div>
              </div>
            </div>
          ) : (
            activeTab && <VirtualizedTable tableId={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
