"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { signOutAction } from "@/app/actions";
import { useCartStore } from "@/store/cartStore";

type UserMenuProps = {
    user: User;
};

export default function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const setUserId = useCartStore((state) => state.setUserId);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const initial = user.email ? user.email[0].toUpperCase() : "U";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center cursor-pointer gap-2 focus:outline-none transition-transform hover:scale-105"
            >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-500 shadow-md">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white font-bold">
                            {initial}
                        </div>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-800 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                        href="/perfil/compras"
                        className="block px-4 py-2 text-sm hover:bg-violet-50 hover:text-violet-700 transition"
                        onClick={() => setIsOpen(false)}
                    >
                        🛍️ Mis Compras
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <form action={signOutAction}>
                        <button
                            type="submit"
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                            onClick={() => {
                                setUserId('');
                                setIsOpen(false);
                            }}
                        >
                            🚪 Salir
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
