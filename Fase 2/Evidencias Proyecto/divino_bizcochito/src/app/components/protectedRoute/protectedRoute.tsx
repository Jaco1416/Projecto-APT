"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  role?: "admin" | "cliente";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, perfil, loading } = useAuth();
  const router = useRouter();

  // Evita SSR de contenido sensible y espera al mount del cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Espera a que perfil exista cuando hay user y se requiere role
  const checking = !mounted || loading || (user && role && perfil === undefined);
  const allowed = !!user && (!role || perfil?.rol === role);

  // Redirige antes del primer paint si es posible
  useLayoutEffect(() => {
    if (checking) return;
    if (!user) {
      router.replace("/views/login");
    } else if (!allowed) {
      router.replace("/views/unauthorized");
    }
  }, [checking, user, allowed, router]);

  if (checking) return <p className="text-center mt-10">Cargando...</p>;

  // No mostrar nada mientras se redirige para evitar parpadeo
  if (!allowed) return null;

  return <>{children}</>;
}