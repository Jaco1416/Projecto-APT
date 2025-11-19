"use client";

import React, { useEffect, useState } from 'react'
import PerfilCard from '@/app/components/PerfilCard/PerfilCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import AdminOptions from '@/app/components/AdminOptions/AdminOptions';
import MisPedidos from '@/app/components/MisPedidos/MisPedidos';
import MisRecetas from '@/app/components/MisRecetas/MisRecetas';

const DEFAULT_IMAGE = "https://kvouupzgdjriuvzynidv.supabase.co/storage/v1/object/public/project_assets/Users/User_default.png";

function PerfilPage() {
    const { user, perfil, loading } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const handleFocus = () => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 500);
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    if (loading || refreshing) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-600 text-lg">Cargando perfil...</p>
            </div>
        );
    }

    const handleSelect = (option: string) => {
        // 🔹 Redirige a la ruta /admin/(opciones)
        router.push(`/admin/${option}`);
    };


    return (
        <div>
            <ProtectedRoute>
                <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 bg-[#F9F4EF]">
                    {/* Si el rol es administrador, mostrar panel */}
                    <PerfilCard
                        nombre={perfil?.nombre || "Juan Pérez"}
                        rol={perfil?.rol || "Cliente"}
                        email={user?.email || "juan.perez@example.com"}
                        telefono={perfil?.telefono || "+56 9 1234 5678"}
                        imagen={perfil?.imagen || DEFAULT_IMAGE}
                        onEditar={() => router.push('/views/perfil/editar')}
                    />
                    {perfil?.rol?.toLowerCase() === "admin" ? (
                        <AdminOptions
                            onSelect={handleSelect}
                        />
                    ) : (
                        <>
                            <MisPedidos />
                            <MisRecetas />
                        </>
                    )}
                </div>
            </ProtectedRoute>
        </div>
    )
}

export default PerfilPage
