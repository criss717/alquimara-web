import CartItem from '@/types/cart';

export default function mergeCarts(cartA: CartItem[], cartB: CartItem[]): CartItem[] {
    const map = new Map<string, CartItem>();
    // Primero agrega los de cartB, luego los de cartA (los de cartA sobrescriben)
    [...cartB, ...cartA].forEach(item => {
        map.set(item.productName, { ...item });
    });
    return Array.from(map.values());
}