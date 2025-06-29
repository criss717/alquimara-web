import { createClient } from "@/utils/supabase/client";
import {CartItem} from "@/types/cart";

export async function saveCartToSupabase(userId: string, cart: CartItem[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("carts")
    .upsert([{ user_id: userId, items: cart }], { onConflict: "user_id" });
  return error;
}

export async function loadCartFromSupabase(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", userId)
    .single();
  if (error) return [];
  return data?.items || [];
}