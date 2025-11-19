"use client";
import React, { useEffect, useState } from 'react'
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from '@/app/components/BackButton/BackButton';
import UsuariosTable from '@/app/components/UsuariosTable/UsuariosTable';

interface Perfil {
  id: string;
  nombre: string;
  rol: string;
  telefono?: string;
  imagen?: string;
}

function usuariosPage() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPerfiles = async () => {
    try {
      const res = await fetch("/api/perfiles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al obtener perfiles");
      }

      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("❌ Error al obtener perfiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfiles();
  }, []);


  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-center text-[#c90c0c]">Usuarios</h1>
        {loading ? (
          <p className="text-center text-gray-600">Cargando usuarios...</p>
        ) : (
          <UsuariosTable
            usuarios={usuarios}
            onDelete={(idEliminado) =>
              setUsuarios((prev) => prev.filter((u) => u.id !== idEliminado))
            }
          />
        )}
      </div>
    </ProtectedRoute>
  )
}

export default usuariosPage
