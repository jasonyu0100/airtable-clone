"use client";

import {
  ArrowRightStartOnRectangleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "~/hooks/useUser";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const { isAuthenticated, user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <main className="flex h-screen flex-col bg-white text-gray-900">
      {isAuthenticated ? (
        <>
          {/* Authenticated user layout */}
          <div className="flex h-16 w-full items-center justify-between border-b border-slate-300 px-6">
            <div className="flex w-1/3 flex-row items-center gap-4">
              <Image
                src="/logo.png"
                alt="Airtable Clone Logo"
                width={40}
                height={40}
                className="h-8 w-8"
              />
              <h1 className="text-xl font-light">Airtable Clone</h1>
            </div>
            <div className="flex w-1/3 items-center justify-center text-center">
              <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-full border border-slate-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex w-1/3 items-center justify-end">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center rounded-full p-1 transition hover:bg-gray-100"
                  title="Account"
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-600" />
                  )}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                    </div>
                    <Link
                      href="/api/auth/signout"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                      Sign out
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex h-full w-full">
            <div className="flex h-full w-72 border-r border-slate-300">
              {/* Sidebar content */}
              <div className="mt-auto w-full p-4">
                <div className="flex h-8 w-full items-center justify-center rounded bg-blue-600 text-center text-white">
                  Create
                </div>
              </div>
            </div>
            <div className="flex h-full flex-1"></div>
          </div>
        </>
      ) : (
        /* Not authenticated - show sign in */
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="w-full max-w-md space-y-8 px-4">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <Image
                  src="/logo.png"
                  alt="Airtable Clone Logo"
                  width={120}
                  height={120}
                  className="h-24 w-24"
                />
              </div>
              <h2 className="text-3xl font-light text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Or start your free trial today
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-light text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
