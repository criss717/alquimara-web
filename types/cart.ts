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
    properties: Array<string>; // Añadido para manejar las propiedades del producto
    stock?: number;
    slug: string;
    quantity: number; // Añadido para manejar la cantidad en el carrito
}