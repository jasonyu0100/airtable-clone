"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "~/stores/userStore";

export default function SignOutPage() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleSignOut = async () => {
    clearUser();
    await signOut({ redirect: false });
    router.push("/");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <div>
          <h2 className="text-3xl font-light text-gray-900">
            Sign out
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to sign out?
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="block w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-light text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}