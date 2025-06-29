export interface CartItem {    
    id: string;    
    quantity : number; // Añadido para manejar la cantidad en el carrito
}

export interface CartCompleto {
    imageUrl: string;
    name: string;
    price: number;
    id: string;
    description?: string;
    stock?: number;
    slug: string;
    quantity: number; // Añadido para manejar la cantidad en el carrito
}