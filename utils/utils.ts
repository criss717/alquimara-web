import { redirect } from "next/navigation";
import { CartCompleto, CartItem } from "@/types/cart";
import { fetchProductos } from "@/utils/cart/fetchProducts";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export const load = async ( //renderiza los productos en la cesta y los skeletons
  cart: CartItem[],
  setProductos: React.Dispatch<React.SetStateAction<CartCompleto[]>>,
  prevIdsRef: React.RefObject<string>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  supabase: SupabaseClient
) => {
  if (cart.length === 0) {
    setProductos([]);
    prevIdsRef.current = "";
    setLoading(false);
    return;
  }
  // comparar ids ordenados para detectar solo cambios de items (no cantidades)
  const ids = cart.map(i => i.id).sort().join(",");
  if (ids === prevIdsRef.current) {
    // solo cambiaron cantidades -> actualizar productos localmente sin fetch ni loading
    setProductos(prev =>
      prev.map(p => {
        const ci = cart.find(c => c.id === p.id);
        return ci ? { ...p, quantity: ci.quantity } : p;
      })
    );
    return;
  }
  // cambiaron items -> fetch completo y mostrar skeleton
  prevIdsRef.current = ids;
  setLoading(true);
  try {
    await fetchProductos(supabase, cart, setProductos, null);
  } finally {
    setLoading(false);
  }
};