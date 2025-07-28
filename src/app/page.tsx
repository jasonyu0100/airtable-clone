import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-light tracking-tight sm:text-[5rem]">
            Airtable <span className="text-gray-500">Clone</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-light text-gray-900">First Steps →</h3>
              <div className="text-base text-gray-600">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-light text-gray-900">Documentation →</h3>
              <div className="text-base text-gray-600">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-gray-700">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-md border border-gray-300 bg-white px-10 py-3 font-light text-gray-700 no-underline transition hover:bg-gray-50 cursor-pointer"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

        </div>
      </main>
    </HydrateClient>
  );
}
