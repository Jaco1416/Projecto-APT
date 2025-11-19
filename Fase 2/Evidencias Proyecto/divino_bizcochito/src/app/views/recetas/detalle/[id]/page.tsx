"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import RecipeDetail from '@/app/components/RecipeDetail/RecipeDetail'
import { useAlert } from "@/app/hooks/useAlert";

function DetalleRecipePage() {
  const { id } = useParams(); // obtiene el id desde la URL
  const router = useRouter();
  const { user, perfil } = useAuth();
  const { showAlert } = useAlert();
  const [receta, setReceta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // 🔹 Obtener receta por ID
  const fetchReceta = async () => {
    try {
      const res = await fetch(`/api/recetas/${id}`);
      if (!res.ok) throw new Error("Error al obtener la receta");
      const data = await res.json();
      setReceta(data);
    } catch (error) {
      console.error("❌ Error al cargar la receta:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReceta();
    }
  }, [id]);

  useEffect(() => {
    if (perfil && receta) {
      setIsOwner(receta.autorId === perfil.id);
    }
  }, [perfil, receta]);

  useEffect(() => {
    if (perfil) {
      setIsAdmin(perfil.rol === 'admin');
    }
  }, [perfil]);

  // 🔹 Acción de publicar
  const handlePublicar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}/estado`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevoEstado: "publicada" })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al publicar receta");
      }
      
      showAlert("✅ Receta publicada correctamente", "success");
      router.push("/admin/recetas");
    } catch (error) {
      console.error(error);
      showAlert("❌ No se pudo publicar la receta", "error");
    }
  };

  // 🔹 Acción de rechazar
  const handleRechazar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}/estado`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevoEstado: "rechazada" })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al rechazar receta");
      }
      
      showAlert("❌ Receta rechazada correctamente", "success");
      router.push("/admin/recetas");
    } catch (error) {
      console.error(error);
      showAlert("❌ No se pudo rechazar la receta", "error");
    }
  };

  // 🔹 Acción de editar
  const handleEditar = (id: number) => {
    router.push(`/views/recetas/editar/${id}`);
  };

  // 🔹 Acción de eliminar
  const handleEliminar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar receta");
      }
      
      showAlert("✅ Receta eliminada correctamente", "success");
      router.push("/views/recetas");
    } catch (error) {
      console.error(error);
      showAlert("❌ No se pudo eliminar la receta", "error");
    }
  };

  // 🔹 Acción de guardar cambios
  const handleGuardar = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/recetas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar cambios");
      }

      showAlert("✅ Cambios guardados correctamente", "success");
      // Recargar la receta actualizada
      fetchReceta();
    } catch (error) {
      console.error(error);
      showAlert("❌ No se pudieron guardar los cambios", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Cargando receta...</p>
      </div>
    );
  }

  if (!receta) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">No se pudo cargar la receta</p>
      </div>
    );
  }

  return (
    <div>
      <RecipeDetail 
        receta={receta} 
        isAdmin={isAdmin}
        isOwner={isOwner}
        onPublicar={handlePublicar} 
        onRechazar={handleRechazar}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onGuardar={handleGuardar}
      />
    </div>
  )
}

export default DetalleRecipePage
