"use client";

import { useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";

interface RecipeDetailProps {
  receta: {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    autor: string;
    autorAvatar?: string;
    imagenUrl: string;
    ingredientes: string;
    pasos: string;
    estado?: string;
  };
  isAdmin?: boolean;
  isOwner?: boolean;
  onPublicar?: (id: number) => void;
  onRechazar?: (id: number) => void;
  onEditar?: (id: number) => void;
  onEliminar?: (id: number) => void;
  onGuardar?: (id: number, data: any) => void;
}

export default function RecipeDetail({
  receta,
  isAdmin = false,
  isOwner = false,
  onPublicar,
  onRechazar,
  onEditar,
  onEliminar,
  onGuardar,
}: RecipeDetailProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReceta, setEditedReceta] = useState({
    titulo: receta?.titulo || "",
    descripcion: receta?.descripcion || "",
    ingredientes: receta?.ingredientes || "",
    pasos: receta?.pasos || "",
  });
  const { showAlert } = useAlert();

  const canEdit = isAdmin || isOwner;
  const isPublished = receta?.estado === "publicada";

  if (!receta || !receta.titulo) {
    return <p>Cargando...</p>;
  }

  const handlePublicar = async () => {
    setLoading(true);
    await onPublicar?.(receta.id);
    setLoading(false);
  };

  const handleRechazar = async () => {
    setLoading(true);
    await onRechazar?.(receta.id);
    setLoading(false);
  };

  const handleEditar = () => {
    onEditar?.(receta.id);
  };

  const handleEliminar = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta receta?")) {
      setLoading(true);
      await onEliminar?.(receta.id);
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    const { titulo, descripcion, ingredientes, pasos } = editedReceta;
    if (
      !titulo.trim() ||
      !descripcion.trim() ||
      !ingredientes.trim() ||
      !pasos.trim()
    ) {
      showAlert("Completa todos los campos antes de guardar los cambios.", "warning");
      return;
    }

    setLoading(true);
    await onGuardar?.(receta.id, {
      titulo,
      descripcion,
      ingredientes,
      pasos,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        {canEdit ? (
          <input
            type="text"
            value={editedReceta.titulo}
            onChange={(e) => setEditedReceta({ ...editedReceta, titulo: e.target.value })}
            className="w-full text-3xl font-bold text-[#C72C2F] text-center mb-8 border-b-2 border-transparent focus:border-[#C72C2F] outline-none bg-transparent"
          />
        ) : (
          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            {receta.titulo}
          </h1>
        )}

        {/* Contenedor principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Imagen */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center justify-center bg-[#C72C2F] text-white rounded-2xl h-[380px] relative overflow-hidden">
              <img
                src={receta.imagenUrl}
                alt={receta.titulo}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Categoría */}
            <div>
              <p className="text-xl">
                <span className="text-[#C72C2F] font-bold">Categoría:</span>{" "}
                <span className="text-gray-800">{receta.categoria}</span>
              </p>
            </div>

            {/* Autor */}
            <div>
              <p className="text-xl flex items-center gap-3">
                <span className="text-[#C72C2F] font-bold">Autor:</span>
                <span className="text-gray-800">{receta.autor}</span>
                <img
                  src={receta.autorAvatar || 'https://kvouupzgdjriuvzynidv.supabase.co/storage/v1/object/sign/project_assets/Users/User_default.png'}
                  alt={receta.autor}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C72C2F] ml-1"
                />
              </p>
            </div>
          </div>

          {/* Descripción, ingredientes y pasos */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-[#000000] font-medium mb-1">
                Descripción
              </label>
              <textarea
                value={editedReceta.descripcion}
                placeholder="Sin descripción"
                onChange={(e) => setEditedReceta({ ...editedReceta, descripcion: e.target.value })}
                readOnly={!canEdit}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:outline-none focus:ring-0 focus:border-gray-300 resize-none ${!canEdit ? 'bg-gray-50' : 'bg-white'}`}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-[#000000] font-medium mb-1">
                Ingredientes
              </label>
              <textarea
                value={editedReceta.ingredientes}
                onChange={(e) => setEditedReceta({ ...editedReceta, ingredientes: e.target.value })}
                readOnly={!canEdit}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:outline-none focus:ring-0 focus:border-gray-300 resize-none ${!canEdit ? 'bg-gray-50' : 'bg-white'}`}
                rows={6}
              />
            </div>

            <div>
              <label className="block text-[#000000] font-medium mb-1">
                Paso a paso
              </label>
              <textarea
                value={editedReceta.pasos}
                onChange={(e) => setEditedReceta({ ...editedReceta, pasos: e.target.value })}
                readOnly={!canEdit}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:outline-none focus:ring-0 focus:border-gray-300 resize-none ${!canEdit ? 'bg-gray-50' : 'bg-white'}`}
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex gap-4 justify-end">
          {/* Mostrar botón guardar si hay cambios y puede editar */}
          {canEdit && JSON.stringify(editedReceta) !== JSON.stringify(receta) && (
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          )}
          
          {/* Mostrar ambos si es admin */}
          {isAdmin ? (
            <>
              {!isPublished && (
                <button
                  onClick={handlePublicar}
                  disabled={loading}
                  className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Procesando..." : "Publicar"}
                </button>
              )}
              <button
                onClick={handleRechazar}
                disabled={loading}
                className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Procesando..." : "Rechazar"}
              </button>
            </>
          ) : isOwner ? (
            // Botón eliminar para el dueño de la receta
            <button
              onClick={handleEliminar}
              disabled={loading}
              className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Eliminando..." : "Eliminar receta"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
