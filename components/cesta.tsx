import React from 'react'
import CartCard from './cartCard'
import { CartCompleto } from '@/types/cart'
import Link from 'next/link'

const Cesta = ({
    productos,
    seleccionados,
    setSeleccionados
}: {
    productos: CartCompleto[],
    seleccionados: string[],
    setSeleccionados: React.Dispatch<React.SetStateAction<string[]>> | null
}) => {
    return (
        <div className="flex-col flex-1">
            {
                productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-10">
                        <p className="text-gray-600">No hay productos en el carrito.</p>
                        <Link href="/productos">
                            <button className="bg-violet-500 text-white py-2 px-4 mt-4 rounded cursor-pointer">
                                Seguir comprando
                            </button>
                        </Link>
                    </div>
                ) : (
                    productos.map((productCart) => (
                        <CartCard
                            key={productCart.id}
                            productCart={productCart}
                            seleccionado={seleccionados.includes(productCart.id)}
                            onSeleccionar={setSeleccionados ? (id, checked) => {
                                setSeleccionados(prev =>
                                    checked ? [...prev, id] : prev.filter(pid => pid !== id)
                                );
                            } : null}
                        />
                    ))
                )
            }
        </div>
    )
}

export default Cesta