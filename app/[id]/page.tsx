import { createClient } from "@/utils/supabase/server";
import ChatAstrologico from "@/components/ChatAstrologico";

export default async function Home() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userName = session?.user?.user_metadata?.fullName || '';

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Bienvenido {userName} a Alquimara</h1>
                <p className="mt-4 text-lg">Tu tienda de jabones artesanales</p>
                <p className="mt-4 text-lg">Explora nuestros productos y descubre la magia de la naturaleza.</p>
            </div>
            <ChatAstrologico  />
        </main>
    );
}