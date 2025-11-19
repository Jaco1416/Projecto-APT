"use client";

import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';
import RecetasTable from '@/app/components/RecetasTable/RecetasTable';
import { useRouter } from "next/navigation";

function RecetasPage() {

  const router = useRouter();

  const handleViewReceta = (id: number) => {
    // Lógica para manejar la visualización de la receta
    router.push(`/views/recetas/detalle/${id}`); // o la ruta que uses
  };

  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <RecetasTable onView={handleViewReceta} />
    </ProtectedRoute>
  )
}

export default RecetasPage