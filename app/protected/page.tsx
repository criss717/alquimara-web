import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userName = user.user_metadata.full_name || "";

  return (
    <div className="flex-1 w-full flex flex-col gap-12 mt-4">
      <div className="w-full">
         <h1 className="text-4xl font-bold">Bienvenido {userName}</h1>
            <p className="mt-4 text-lg">Tu tienda de jabones artesanales</p>
            <p className="mt-4 text-lg">Explora nuestros productos y descubre la magia de la naturaleza.</p>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>  
    </div>
  );
}
