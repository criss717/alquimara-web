import { CartCompleto } from "@/types/cart";
import { useCartStore } from "@/store/cartStore";
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

export default function CantidadComponent({
    item,
}: {
    item: CartCompleto;
}) {
    const addToCart = useCartStore((state) => state.addToCart);
    const substractToCart = useCartStore((state) => state.substractToCart);
    return (
        <div className="flex items-center justify-between w-full mb-2">
            {item.quantity < 2 ?
                <button
                    onClick={() => substractToCart(item)}
                    className="text-red-500 hover:text-red-700 transition duration-300 cursor-pointer"
                >
                    <RemoveShoppingCartIcon />
                </button>
                : <button
                    onClick={() => substractToCart(item)}
                    className="text-red-500 hover:text-red-700 transition duration-300 cursor-pointer text-bold text-xl"
                >
                    -
                </button>
            }

            <span className="font-bold">{item.quantity}</span>
            <button
                onClick={() => {
                    addToCart({ id: item.id });
                }}
                className="text-violet-500 hover:text-violet-700 transition duration-300 text-bold text-2xl cursor-pointer"
            >
                +
            </button>
        </div>
    )
}
