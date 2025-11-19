"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/app/hooks/useAlert";
import { supabase } from "@/lib/supabaseClient";

const formatTelefono = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4)}`.trim();
};

export default function EditProfile() {
  const { perfil, user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [imagen, setImagen] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre || "");
      const tel = perfil.telefono?.replace("+56 9 ", "") || "";
      setTelefono(formatTelefono(tel));
      setPreview(perfil.imagen || "");
      setImagen(perfil.imagen || "");
    }
  }, [perfil]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil?.id) {
      showAlert("No se encontró el perfil para actualizar.", "error");
      return;
    }

    if (!nombre.trim() || !telefono.trim()) {
      showAlert("Completa todos los campos antes de guardar.", "warning");
      return;
    }

    if (telefono.replace(/\s/g, "").length !== 8) {
      showAlert("El teléfono debe tener 8 dígitos (formato 8888 8888).", "warning");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = imagen || perfil.imagen || "";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `Users/${perfil.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("project_assets")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("project_assets")
          .getPublicUrl(filePath);

        imageUrl = publicUrl.publicUrl;
        setImagen(imageUrl);
      }

      const payload = {
        id: perfil.id,
        nombre: nombre.trim(),
        telefono: `+56 9 ${telefono}`,
        imagen: imageUrl,
        rol: perfil.rol,
      };

      const res = await fetch("/api/perfiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar perfil");

      showAlert("Perfil actualizado correctamente.", "success");
      setTimeout(() => {
        router.push("/views/perfil");
      }, 1000);
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
      showAlert("No se pudo actualizar el perfil.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-10 px-4">
      <div className="w-full max-w-2xl bg-[#E7D7C3] border border-[#C72C2F] rounded-2xl p-6 shadow-md">
        <h1 className="text-3xl font-bold text-center text-[#C72C2F] mb-6">
          Editar perfil
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#C72C2F] bg-[#f5e9df]">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sin foto
                </div>
              )}
            </div>
            <label
              htmlFor="imagen"
              className="px-4 py-2 bg-[#C72C2F] text-white rounded-lg cursor-pointer hover:bg-[#A92225] transition"
            >
              Cambiar foto
            </label>
            <input
              id="imagen"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label className="block text-[#530708] font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              required
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
            />
          </div>

          <div>
            <label className="block text-[#530708] font-medium mb-1">Teléfono</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-lg border bg-gray-100 text-gray-700 whitespace-nowrap">
                +56 9
              </span>
              <input
                type="text"
                value={telefono}
                maxLength={9}
                required
                onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                placeholder="8888 8888"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Formato requerido: 8888 8888</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
