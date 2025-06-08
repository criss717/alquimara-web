export default interface CartItem {
    productName: string;
    productPrice: number;
    imageUrl: string;
    quantity: number;
    shown?: boolean;
}