import { GoogleSignInButton } from "@/components/GoogleSignInBootom";
import { login } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return (
      redirect("/")
    );
  }
  return (
    <div className="p-10 w-md mx-auto flex flex-col gap-4">
      <form className="flex flex-col gap-4" action="/login" method="POST">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border border-gray-300 rounded p-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border border-gray-300 rounded p-2"
          required
        />
        <button
          type="submit"
          formAction={login}
          className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 cursor-pointer"
        >
          Login
        </button>
        <GoogleSignInButton />
      </form>
    </div>
  );
}
