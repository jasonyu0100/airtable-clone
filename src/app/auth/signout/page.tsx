import { signOut } from "~/server/auth";

export default function SignOutPage() {
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
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
          <a
            href="/"
            className="block w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-light text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}