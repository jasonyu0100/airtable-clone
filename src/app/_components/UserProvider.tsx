"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "~/stores/userStore";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setUser, setLoading, clearUser } = useUserStore();

  useEffect(() => {
    setLoading(status === "loading");

    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        emailVerified: (session.user as any).emailVerified ?? null,
      });
    } else if (status === "unauthenticated") {
      clearUser();
    }
  }, [session, status, setUser, setLoading, clearUser]);

  return <>{children}</>;
}