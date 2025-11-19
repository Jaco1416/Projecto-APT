"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";
import { useAlert } from "@/app/hooks/useAlert";

interface Producto {
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: File | string | null;
    categoriaId: string;
    toppingId: string;
    rellenoId: string;
}

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Topping {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Relleno {
    id: number;
    nombre: string;
    descripcion: string;
}

export default function CrearProductoPage() {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [producto, setProducto] = useState<Producto>({
        nombre: "",
        descripcion: "",
        precio: 0,
        imagen: null,
        categoriaId: "",
        toppingId: "",
        rellenoId: "",
    });

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [rellenos, setRellenos] = useState<Relleno[]>([]);
    const [preview, setPreview] = useState<string>("");
    const [saving, setSaving] = useState(false);

    // 🔁 Obtener listas desde la BD
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, topRes, relRes] = await Promise.all([
                    fetch("/api/categorias"),
                    fetch("/api/toppings"),
                    fetch("/api/relleno"),
                ]);

                const [catData, topData, relData] = await Promise.all([
                    catRes.json(),
                    topRes.json(),
                    relRes.json(),
                ]);

                if (catRes.ok) setCategorias(catData);
                if (topRes.ok) setToppings(topData);
                if (relRes.ok) setRellenos(relData);
            } catch (error) {
                console.error("❌ Error al cargar listas:", error);
            }
        };

        fetchData();
    }, []);

    // 🧾 Actualizar campos
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const target = e.target as HTMLInputElement;
        let value: any;

        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.type === "number") {
            value = Number(target.value);
        } else if (target.type === "file") {
            const file = target.files?.[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            setPreview(url); // 👈 muestra vista previa
            value = file.name; // o guarda el file si prefieres: value = file;
        } else {
            value = target.value;
        }

        setProducto((prev) => ({
            ...prev,
            [target.name]: value,
        }));
    };

    // 💾 Crear producto
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (producto.precio <= 0) {
                showAlert("El precio debe ser mayor a 0.", "warning");
                setSaving(false);
                return;
            }
            const formData = new FormData();

            formData.append("nombre", producto.nombre);
            formData.append("descripcion", producto.descripcion);
            formData.append("precio", producto.precio.toString());
            if (producto.imagen) formData.append("imagen", producto.imagen);
            formData.append("categoriaId", producto.categoriaId || "");
            formData.append("toppingId", producto.toppingId || "");
            formData.append("rellenoId", producto.rellenoId || "");

            const res = await fetch("/api/productos", {
                method: "POST",
                body: formData, // 👈 Enviamos FormData, sin headers manuales
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al crear producto");

            showAlert("✅ Producto creado correctamente", "success");
            router.push("/admin/productos");
        } catch (error) {
            console.error("❌ Error al crear producto:", error);
            showAlert("❌ No se pudo crear el producto", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute role="admin">
            <div className="min-h-screen bg-white py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <BackButton label="Volver a la lista" />

                    <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
                        Crear producto
                    </h1>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
                    >
                        {/* Imagen */}
                        <div className="flex flex-col items-center justify-center bg-[#C72C2F] text-white rounded-2xl h-[380px] relative overflow-hidden">
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="Vista previa"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* 🔘 Botón para quitar imagen */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreview("");
                                            setProducto({ ...producto, imagen: null });
                                        }}
                                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
                                        title="Quitar imagen"
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <label
                                    htmlFor="imagen"
                                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-16 w-16 mb-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-center font-medium">
                                        Subir foto del producto final
                                    </p>
                                </label>
                            )}

                            <input
                                id="imagen"
                                type="file"
                                name="imagen"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = URL.createObjectURL(file);
                                    setPreview(url);
                                    setProducto({ ...producto, imagen: file });
                                }}
                            />
                        </div>



                        {/* Campos de texto */}
                        <div className="flex flex-col gap-5">
                            {/* Nombre */}
                            <div>
                                <label className="block text-[#000000] font-medium mb-1">
                                    Nombre del producto
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={producto.nombre}
                                    required
                                    onChange={handleChange}
                                    placeholder="Ingresar nombre del producto..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-[#000000] font-medium mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={producto.descripcion}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ingresar descripción del producto..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                />
                            </div>

                            {/* Topping */}
                            <div>
                                <label className="block text-[#000000] font-medium mb-1">
                                    Topping
                                </label>
                                <select
                                    name="toppingId"
                                    value={producto.toppingId || ""}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                >
                                    <option value="">Seleccionar topping</option>
                                    {toppings.map((t: Topping) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Relleno */}
                            <div>
                                <label className="block text-[#000000] font-medium mb-1">
                                    Relleno
                                </label>
                                <select
                                    name="rellenoId"
                                    value={producto.rellenoId || ""}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                >
                                    <option value="">Seleccionar relleno</option>
                                    {rellenos.map((r: Relleno) => (
                                        <option key={r.id} value={r.id}>
                                            {r.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-[#020202] font-medium mb-1">
                                    Categoría
                                </label>
                                <select
                                    name="categoriaId"
                                    value={producto.categoriaId || ""}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((c: Categoria) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Precio */}<label className="block text-[#000000] font-medium mb-1">
                                Precio c/u
                            </label>
                            <div className="flex items-center justify-between mt-4">

                                <input
                                    type="number"
                                    min="1"
                                    name="precio"
                                    value={producto.precio}
                                    onChange={handleChange}
                                    required
                                    placeholder="$0"
                                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition cursor-pointer"
                                >
                                    {saving ? "Guardando..." : "Crear"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
