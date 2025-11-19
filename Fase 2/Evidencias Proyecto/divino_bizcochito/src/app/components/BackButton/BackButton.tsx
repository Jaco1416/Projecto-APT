"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  to?: string;
}

export default function BackButton({ label = "Volver", to }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const ADMIN_PROFILE = "/views/perfil";
  const ADMIN_SECTIONS = [
    "/admin/productos",
    "/admin/categorias",
    "/admin/toppings",
    "/admin/rellenos",
    "/admin/pedidos",
    "/admin/usuarios",
    "/admin/recetas",
  ];

  const resolveFallbackRoute = () => {
    if (!pathname) return null;
    for (const base of ADMIN_SECTIONS) {
      if (pathname === base) {
        return ADMIN_PROFILE;
      }
      if (pathname.startsWith(`${base}/`)) {
        return base;
      }
    }
    return null;
  };

  const handleback = () => {
    if (to) {
      router.push(to);
      return;
    }
    const fallbackRoute = resolveFallbackRoute();
    if (fallbackRoute) {
      router.push(fallbackRoute);
      return;
    }
    router.back();
  };

  return (
    <button
      onClick={handleback}
      className="flex items-center gap-2 bg-[#C72C2F] text-white font-medium px-5 py-2 rounded-lg shadow-md hover:bg-[#A92225] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#530708] m-5"
    >
      <ArrowLeft className="w-5 h-5" />
      {label}
    </button>
  );
}
