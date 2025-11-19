"use client";
import React from 'react'
import { useEffect, useState } from "react";
import RellenoTable from "@/app/components/RellenosTable/RellenosTable";
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';
import Link from 'next/link';

interface Relleno {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function RellenosPage() {

   const [rellenos, setRellenos] = useState<Relleno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRellenos = async () => {
      const res = await fetch("/api/relleno");
      const data = await res.json();
      setRellenos(data);
      setLoading(false);
    };

    fetchRellenos();
  }, []);

  if (loading) { 
    return( 
    <ProtectedRoute role="admin">
      <div className="min-h-screen flex items-center justify-center text-[#530708] font-medium">
      Cargando rellenos...
      </div>
    </ProtectedRoute>
  )
}
  return (
<ProtectedRoute role="admin">
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/*BTN volver*/}
          <div className="flex items-center justify-between mb-6">
            <BackButton label="Volver al panel" to="/views/perfil" />
          </div>

          {/* Título de la página */}
          <h1 className="text-3xl font-bold text-[#530708] text-center mb-8">
            Lista de rellenos
          </h1>

          {/*TBL rellenos */}
          <RellenoTable rellenos={rellenos} />

          {/*BTN nuevo relleno*/}
          <div className="mt-6 flex justify-start">
            <Link href="/admin/rellenos/crear">
              <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-5 py-2 rounded-lg transition cursor-pointer">
                + Nuevo relleno
              </button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}