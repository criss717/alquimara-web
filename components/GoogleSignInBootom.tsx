"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`, // Cambia esto según tu configuración
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full mt-2 flex items-center justify-center gap-2 border border-gray-300 rounded-md p-2 text-sm hover:bg-gray-100 cursor-pointer"
    >
      <Image
        src="/icon-google.png"
        alt="Google Logo"
        width={20}
        height={20}
      />
      <span>  Ingresar con Google</span>
    </button>
  );
}