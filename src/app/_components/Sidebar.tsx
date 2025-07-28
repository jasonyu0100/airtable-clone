"use client";

import { HomeIcon, StarIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface SidebarProps {
  currentView: "home" | "starred";
  onViewChange: (view: "home" | "starred") => void;
  onCreateClick: () => void;
}

export function Sidebar({ currentView, onViewChange, onCreateClick }: SidebarProps) {
  return (
    <div className="flex h-full w-72 border-r border-slate-300 flex-col">
      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <button
            onClick={() => onViewChange("home")}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
              currentView === "home"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {currentView === "home" ? (
              <HomeIconSolid className="h-5 w-5" />
            ) : (
              <HomeIcon className="h-5 w-5" />
            )}
            Home
          </button>
          
          <button
            onClick={() => onViewChange("starred")}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
              currentView === "starred"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {currentView === "starred" ? (
              <StarIconSolid className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
            Starred
          </button>
        </nav>
      </div>

      {/* Create Button */}
      <div className="mt-auto w-full p-4">
        <button
          onClick={onCreateClick}
          className="flex h-8 w-full items-center justify-center rounded bg-blue-600 text-center text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Create
        </button>
      </div>
    </div>
  );
}