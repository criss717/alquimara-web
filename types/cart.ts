export default interface CartItem {
    productName: string;
    productPrice: number;
    id: string;
    description?: string;
    stock?: number;
    imageUrl: string;
    quantity: number;
    shown?: boolean;
}