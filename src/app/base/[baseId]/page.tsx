"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
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

  const tabs = [
    { id: "table1", name: "Table 1" },
    { id: "table2", name: "Table 2" },
    { id: "table3", name: "Table 3" },
  ];

  return (
    <div className="flex h-screen flex-row bg-white text-gray-900">
      {/* Header */}
      <div className="flex h-full w-16 justify-center border-r border-slate-300 py-4">
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
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? `rounded-t-md border-t border-r border-b-0 border-slate-300 bg-white text-gray-900 ${index > 0 ? "border-l border-slate-300" : ""}`
                    : "border-b border-slate-300 bg-green-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.name}
                {/* Half-height divider positioned absolutely to not interfere with border */}
                {index < tabs.length - 1 &&
                  activeTab !== tab.id &&
                  activeTab !== tabs[index + 1]?.id && (
                    <div className="absolute top-2 -right-px h-4 w-px bg-slate-300"></div>
                  )}
              </button>
            ))}
            {/* Plus button for adding new tables */}
            <button
              className="flex items-center gap-2 border-b border-slate-300 px-4 text-gray-600 transition-colors hover:bg-green-200 hover:text-gray-900"
              title="Add new table"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
            {/* Fill remaining space with border */}
            <div className="flex-1 border-b border-slate-300"></div>
          </div>

          {/* Tab content area header */}
          <div className="h-14 w-full"></div>
        </div>

        {/* Main content area */}
        <div className="flex-1 bg-white">
          <div className="p-6">
            <div className="text-center text-gray-500">
              <div className="text-lg font-light">
                {tabs.find((tab) => tab.id === activeTab)?.name} Content
              </div>
              <div className="text-sm">
                Table content will be displayed here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
