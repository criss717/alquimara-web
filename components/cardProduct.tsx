//componente para la tarjeta de producto

"use client";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type CardProductProps = {
    imageUrl: string;
    productName: string;
    productPrice: number;
};

export default function CardProduct({ imageUrl, productName, productPrice }: CardProductProps) {  
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    const handleAddToCart = async () => {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.from("cart").insert([
        {
            product_name: productName,
            product_price: productPrice,
            image_url: imageUrl,
        },
        ]);
    
        if (error) {
        console.error("Error adding to cart:", error);
        } else {
        console.log("Product added to cart:", data);
        router.push("/cart"); // Redirigir a la página del carrito después de agregar el producto
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full h-100 border rounded-xl p-2 flex flex-col items-center justify-center">
            <div className="w-64 h-64 relative">
                <Image
                    src={imageUrl}
                    alt={productName}
                    fill
                    className="object-cover rounded-full p-3"
                />
            </div>
            <h3 className="text-lg font-bold mt-2">{productName}</h3>
            <p className="text-sm text-gray-600">${productPrice}</p>
            <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`mt-2 px-4 py-2 bg-blue-500 text-white rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {isLoading ? "Adding..." : "Add to Cart"}
            </button>
        </div>
    );
}