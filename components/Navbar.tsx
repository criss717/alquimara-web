import Link from "next/link";
import React from "react";
import SearchProducts from "./SearchProducts";
import { signOutAction } from "@/app/actions";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

const Navbar = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    const userName = user?.user_metadata?.name.split(' ')[0] || ''

    return (
        <nav className="bg-purple-900 grid grid-cols-12 py-3 text-white fixed top-0 left-0 w-full z-50 h-36 shadow-2xl">
            <div className="mx-auto col-span-3 px-4 flex  items-center">
                <Image
                    src="/logo A (alquimara) final sin fondo.png"
                    alt="Logo"
                    width={120}
                    height={120}
                    className="object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                />
                <div className="flex flex-col ml-2">
                    <div className="text-2xl font-extrabold">
                        <Link href="/">Hola, {userName} </Link>
                    </div>
                    <p className="font-bold">Jabones Artesanales</p>
                </div>
            </div>
            <div className=" mx-auto col-span-4 px-4 flex items-center justify-between">
                <div className="ml-2">
                    <SearchProducts />
                </div>
            </div>
            <div className="mx-auto col-span-5 px-4 flex items-center justify-center">
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