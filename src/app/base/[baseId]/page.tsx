"use client";

import { faker } from "@faker-js/faker";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { VirtualizedTable } from "~/app/_components/VirtualizedTable";
import { api } from "~/trpc/react";

interface BasePageProps {
  params: Promise<{
    baseId: string;
  }>;
}

export default function BasePage({ params }: BasePageProps) {
  const { baseId } = use(params);
  const [activeTab, setActiveTab] = useState("table1");
  const [progressState, setProgressState] = useState<{
    isOpen: boolean;
    currentBatch: number;
    totalBatches: number;
    progress: number;
  }>({
    isOpen: false,
    currentBatch: 0,
    totalBatches: 0,
    progress: 0,
  });

  // Fetch base data to get the base name
  const { data: bases } = api.base.getUserBases.useQuery();
  const currentBase = bases?.find((base) => base.id === baseId);

  // Fetch tables for this base
  const { data: tables = [] } = api.table.getByBaseId.useQuery({ baseId });

  // Create table mutation
  const utils = api.useUtils();
  const createTable = api.table.create.useMutation({
    onSuccess: () => {
      void utils.table.getByBaseId.invalidate({ baseId });
    },
  });

  // Get current active table data for 100K row creation
  const { data: tableData } = api.table.getById.useQuery(
    { id: activeTab },
    { enabled: !!activeTab && activeTab !== "table1" }
  );

  const createBulkRows = api.row.createBulk.useMutation({
    onSuccess: () => {
      void utils.row.getByTableId.invalidate({ tableId: activeTab });
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

  const handleCreate100KRows = async () => {
    if (!tableData?.columns || tableData.columns.length === 0) {
      alert("Please create some columns first!");
      return;
    }

    if (!activeTab || activeTab === "table1") {
      alert("Please select a table first!");
      return;
    }

    const confirmed = confirm("This will create 100,000 rows. Continue?");
    if (!confirmed) return;

    const totalRows = 100000;
    const batchSize = 10000;
    const numBatches = Math.ceil(totalRows / batchSize);

    setProgressState({
      isOpen: true,
      currentBatch: 0,
      totalBatches: numBatches,
      progress: 0,
    });

    try {
      for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
        console.log(`Processing batch ${batchIndex + 1}/${numBatches}...`);

        const batchRows = [];
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, totalRows);

        for (let i = startIndex; i < endIndex; i++) {
          const cells = tableData.columns.map((column) => ({
            columnId: column.id,
            value:
              column.type === "NUMBER"
                ? faker.number.int({ min: 1, max: 10000 }).toString()
                : faker.lorem.words(3),
          }));

          batchRows.push({
            name: faker.person.fullName(),
            cells,
          });
        }

        await createBulkRows.mutateAsync({
          tableId: activeTab,
          rows: batchRows,
        });

        const progress = Math.round(((batchIndex + 1) / numBatches) * 100);
        setProgressState({
          isOpen: true,
          currentBatch: batchIndex + 1,
          totalBatches: numBatches,
          progress,
        });

        console.log(
          `Completed batch ${batchIndex + 1}/${numBatches} (${batchRows.length} rows)`,
        );
      }

      // Success - close modal after a short delay
      setTimeout(() => {
        setProgressState(prev => ({ ...prev, isOpen: false }));
        alert("Successfully created 100,000 rows!");
      }, 1000);
    } catch (error) {
      console.error("Error creating rows:", error);
      setProgressState(prev => ({ ...prev, isOpen: false }));
      alert("Error creating rows. Check console for details.");
    }
  };

  return (
    <div className="flex h-screen flex-row bg-white text-gray-900">
      {/* Header */}
      <div className="flex h-full w-16 justify-center border-r border-slate-300 py-2">
        <Link
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
        </Link>
      </div>
      <div className="flex h-full flex-1 flex-col">
        {/* Header area */}
        <div className="flex h-16 w-full items-center border-b border-slate-300 px-3">
          <h1 className="text-2xl font-light text-gray-900">
            {currentBase?.name ?? "Loading..."}
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
              <button 
                onClick={() => void handleCreate100KRows()}
                className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={progressState.isOpen}
              >
                {progressState.isOpen ? "Creating..." : "Create 100K rows"}
              </button>
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
                  Click &quot;Add&quot; to create your first table
                </div>
              </div>
            </div>
          ) : (
            activeTab && <VirtualizedTable tableId={activeTab} />
          )}
        </div>

        {/* Progress Modal */}
        {progressState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Creating 100,000 Rows
              </h3>
              
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>Batch {progressState.currentBatch} of {progressState.totalBatches}</span>
                  <span>{progressState.progress}%</span>
                </div>
                
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progressState.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Processing in batches of 10,000 rows to prevent memory issues...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
