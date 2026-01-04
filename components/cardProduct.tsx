//componente para la tarjeta de producto
"use client";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./ui/addToCartButton";
import CardProductProps from "@/types/cardProductProps";

export default function CardProduct({ imageUrl, name, price, id, slug, stock }: CardProductProps) {

    return (
        <Link href={`/productos/${encodeURIComponent(slug)}`}>
            <div className="w-full h-100 border rounded-xl p-2 flex flex-col items-center justify-center hover:shadow-lg transition-shadow hover:scale-105 duration-200">
                <div className="md:w-54 md:h-54 w-34 h-34 2xl:w-60 2xl:h-60 relative hover:scale-105 transition-transform duration-200">
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                        className="rounded-full p-3"
                    />
                </div>
                <h3 className="text-lg font-bold mt-2">{name}</h3>
                <p className="text-sm text-gray-600">{price}€</p>
                <AddToCartButton
                    id={id}
                    stock={stock ? stock : 0}
                />
            </div>
        </Link>

    );
}