"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { Base } from "~/types/base";

function getBaseInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getBaseColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];

  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length]!;
}

interface BasesListProps {
  view: "home" | "starred";
  searchQuery: string;
}

export function BasesList({ view, searchQuery }: BasesListProps) {
  const router = useRouter();
  const { data: allBases, isLoading: isLoadingAll } =
    api.base.getUserBases.useQuery();
  const { data: starredBases, isLoading: isLoadingStarred } =
    api.base.getStarredBases.useQuery(undefined, {
      enabled: view === "starred",
    });
  const utils = api.useUtils();

  const bases = useMemo(() => {
    const basesToFilter = view === "starred" ? starredBases : allBases;
    if (!basesToFilter) return [];

    if (!searchQuery) return basesToFilter;

    return basesToFilter.filter((base: Base) =>
      base.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [view, searchQuery, allBases, starredBases]);

  const isLoading = view === "starred" ? isLoadingStarred : isLoadingAll;

  const toggleStar = api.base.toggleStar.useMutation({
    onSuccess: async () => {
      await utils.base.getUserBases.invalidate();
      await utils.base.getStarredBases.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-gray-500">Loading bases...</div>
      </div>
    );
  }

  if (!bases || bases.length === 0) {
    return (
      <div className="flex h-32 w-full flex-col p-6 text-gray-500">
        <div className="text-lg font-light">
          {view === "starred" ? "No starred bases" : "No bases yet"}
        </div>
        <div className="text-sm">
          {view === "starred"
            ? "Star some bases to see them here"
            : "Create your first base to get started"}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-3 gap-4 p-6">
      {bases.map((base: Base) => (
        <div
          key={base.id}
          onClick={() => router.push(`/base/${base.id}`)}
          className="group relative h-24 cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
        >
          <div className="flex h-full items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg text-sm font-medium text-white ${getBaseColor(base.name)}`}
              >
                {getBaseInitials(base.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-medium text-gray-900">
                  {base.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Created {new Date(base.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStar.mutate({ id: base.id });
              }}
              className="ml-4 flex-shrink-0 rounded p-1 hover:bg-gray-100"
            >
              {base.starred ? (
                <StarIconSolid className="h-5 w-5 text-yellow-400" />
              ) : (
                <StarIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
