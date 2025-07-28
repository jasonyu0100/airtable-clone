"use client";

import { useUserStore } from "~/stores/userStore";

export function useUser() {
  const { user, isLoading } = useUserStore();
  return { user, isLoading, isAuthenticated: !!user };
}