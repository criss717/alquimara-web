import { createClient } from "@/utils/supabase/server";
import ChatAstrologico from "@/components/ChatAstrologico";
import ProductCarousel from "@/components/ProductCarousel";
import ScrollToChat from "@/components/ScrollToChat";
import { fetchProductsForCarousel } from "@/utils/cart/fetchProducts";

export default async function Home() {
     const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userName = user?.user_metadata.full_name || "";
    const products = await fetchProductsForCarousel(supabase);

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12">
            <div className="text-center mb-1">
                <h1 className="text-4xl font-bold">Bienvenido {userName} a Alquimara</h1>      
                <p className="mt-4 text-lg">Explora nuestros productos y descubre la magia de la naturaleza.</p>
            </div>
            <ScrollToChat />
            <div className="w-full mb-12">
                <ProductCarousel products={products} />
            </div>
            <div id="chat-section" className="w-full flex justify-center">
                <ChatAstrologico />
            </div>
        </main>
    );
}
