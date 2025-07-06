import { CartCompleto } from "@/types/cart";
import Image from "next/image";
import Link from "next/link";
import CantidadComponent from "./cantidadComponent";

export default function CartCard({ productCart }: { productCart: CartCompleto }) {
    return (
        <div className="w-full h-[200px] border-b-[1px] p-2 flex items-center">
            <Link className="w-[200px] h-[200px] flex items-center justify-center" href={`/productos/${encodeURIComponent(productCart.slug)}`}>
                <Image
                    src={productCart.imageUrl}
                    alt={productCart.name}
                    width={180}
                    height={180}
                    className="object-cover"
                />
            </Link>
            <div className="self-start flex flex-col px-2 flex-1 justify-center py-6">
                <Link className="text-lg font-semibold mb-1" href={`/productos/${encodeURIComponent(productCart.slug)}`}>
                    {productCart.name}
                </Link>
                {productCart.stock ? <p className="text-sm text-gray-600 mb-2">{`Stock: ${productCart.stock}`}</p> : null}
                <p className="text-sm text-gray-600 mb-2">{productCart.description}</p>
                <ol className="list-disc pl-5 mb-2">
                    {productCart?.properties.length && 
                        productCart.properties.map((property, index) => (
                        <li key={index} className="text-sm text-gray-600 mb-2">{property}</li>
                    ))}
                </ol>
            </div>
            <div className="w-[80px] self-start">
                <div className="w-[100px]">
                    <CantidadComponent item={productCart} />
                </div>
                <p className="text-gray-600 font-bold text-center">{productCart.price}€</p>
            </div>
        </div>
    );
}