"use client";
import Link from "next/link";
import React from "react";
import SearchProducts from "./SearchProducts";
import { signOutAction } from "@/app/actions";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import { useCartStore } from "@/store/cartStore";

type NavbarProps = {
    user: User | null;
}

const Navbar = ({ user }: NavbarProps) => {
    const userName = user?.user_metadata?.name?.split(' ')[0] || ''
    const setUserID = useCartStore((state) => state.setUserId);
    return (
        <nav className="bg-[#1f1f1f] grid grid-cols-12 overflow-hidden text-white fixed top-0 left-0 w-full z-50 h-[100px] shadow-2xl">
            <div className="col-span-4 flex items-center mx-4">
                <Link href="/">
                    <Image
                        src="/Nombre logo pagina web sin fondo.png"
                        alt="Logo"
                        width={125}
                        height={125}
                        priority
                        className="transition-transform duration-300 hover:scale-105 cursor-pointer w-auto"
                    />
                </Link>
                <div className="flex flex-col ml-2">
                    <div className="text-l font-extrabold">
                        Hola, {userName}
                    </div>
                    <p className="font-bold">Magia, astrología y bienestar</p>
                </div>
            </div>
            <div className=" mx-auto col-span-4 px-4 flex items-center justify-between">
                <div className="ml-2">
                    <SearchProducts />
                </div>
            </div>
            <div className="mx-auto col-span-4 px-4 flex items-center justify-center">
                <ul className="flex space-x-6 justify-center">
                    <li>
                        <Link
                            href="/productos"
                            className="hover:text-gray-300 transition duration-300"
                        >
                            Productos
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/carrito"
                            className="hover:text-gray-300 transition duration-300"
                        >
                            <LocalGroceryStoreIcon />
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/about"
                            className="hover:text-gray-300 transition duration-300"
                        >
                            Sobre Nosotros
                        </Link>
                    </li>
                    {!user ? (
                        <li>
                            <Link
                                href="/login"
                                className="hover:text-gray-300 transition duration-300"
                            >
                                Ingresar
                            </Link>
                        </li>
                    ) : (
                        <li>
                            <form action={signOutAction}>
                                <button
                                    type="submit"
                                    className="hover:text-gray-300 transition duration-300 cursor-pointer"
                                    onClick={() => setUserID('')}
                                >
                                    Salir
                                </button>
                            </form>
                        </li>
                    )
                    }

                </ul>
            </div>
        </nav>
    );
};

export default Navbar;