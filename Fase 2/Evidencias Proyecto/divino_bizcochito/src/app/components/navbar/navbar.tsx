"use client";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {

    const { user, perfil, handleLogout } = useAuth();

    return (
        <nav className="w-full bg-[#EDE2D3] flex items-center justify-between px-8 py-3 shadow-sm">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="w-20 h-20 rounded-full flex items-center justify-center">
                    <Link href="/">
                        <Image
                            src="/assets/Divino_bizcochito_2.png"
                            alt="Divino Bizcochito"
                            width={500}
                            height={500}
                        />
                    </Link>

                </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-[#C72C2F] text-sm">
                <Link href="/views/catalogo" className="hover:underline">
                    Catálogo
                </Link>
                <Link href="/views/recetas" className="hover:underline">
                    Recetas
                </Link>
                <Link href="/views/perfil" className="hover:underline">
                    Perfil
                </Link>
                <Link href="/views/carrito" className="hover:underline">
                    Carrito
                </Link>
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="bg-[#C72C2F] text-white px-4 py-1 rounded-md hover:bg-[#a62426] transition cursor-pointer"
                    >
                        Cerrar sesión
                    </button>
                ) : (
                    <button
                        onClick={() => (window.location.href = "/views/login")}
                        className="bg-[#C72C2F] text-white px-4 py-1 rounded-md hover:bg-[#a62426] transition cursor-pointer"
                    >
                        Iniciar sesión
                    </button>
                )}

            </div>
        </nav>
    );
}
