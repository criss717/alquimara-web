import CardProductProps from "@/types/cardProductProps";
import { CartCompleto, CartItem } from "@/types/cart";
import { SupabaseClient } from "@supabase/supabase-js";

export const fetchProductos = async function (
    supabase: SupabaseClient,
    cart: CartItem[],
    setProductos: React.Dispatch<React.SetStateAction<CartCompleto[]>>,
    seleccionados: string[] | null
) {
    //hallar los productos basados en los ids del carrito
    const ids = cart.map((item) => item.id);
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .in('id', ids);
    //buscar imagenes storage supabase y agregar quantity
    let dataCompleta = [];
    if (data) {
        dataCompleta = data.map((item) => {
            const cartItem = cart.find((cartItem) => cartItem.id === item.id);
            return {
                ...item,
                imageUrl: supabase.storage.from('imagenes-jabones').getPublicUrl(item.image_path).data.publicUrl,
                quantity: cartItem ? cartItem.quantity : 0,
            };
        });
    }
    // Ordena según el orden de los IDs en el carrito
    dataCompleta.sort(
        (a, b) => cart.findIndex(ci => ci.id === b.id) - cart.findIndex(ci => ci.id === a.id)
    );
    if(seleccionados?.length) {
        console.log("data antes:", dataCompleta);

        dataCompleta = dataCompleta.filter(item => seleccionados.includes(item.id.toString()));
        console.log("Productos filtrados:", dataCompleta);
    }
    if (!error) setProductos(dataCompleta);
    else setProductos([]);
};

export async function fetchProductsForCarousel(supabase: SupabaseClient): Promise<CardProductProps[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("id, name, slug, price, description, image_path")
    .limit(10);

  if (error) {
    console.error("Error fetching products for carousel:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  const productsWithUrls = data.map((product) => ({
    ...product,
    imageUrl: supabase.storage.from('imagenes-jabones').getPublicUrl(product.image_path).data.publicUrl,
  }));

  return productsWithUrls as unknown as CardProductProps[];
}

