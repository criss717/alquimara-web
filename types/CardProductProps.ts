export default interface CardProductProps {
    imageUrl: string;
    name: string;
    price: number;
    id: string;
    description?: string;
    stock?: number;
    slug: string;
}