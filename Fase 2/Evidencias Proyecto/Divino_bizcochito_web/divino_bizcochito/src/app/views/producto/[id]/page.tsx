"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetail from "@/app/components/ProductDetail/ProductDetail";

interface Categoria {
  id: number;
  nombre: string;
}

interface Opcion {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  categoriaId: number;

  // Opcionales: depende de lo que devuelva tu backend
  toppingId?: number | null;
  rellenoId?: number | null;
  toppingNombre?: string | null;
  rellenoNombre?: string | null;
}

export default function DetalleProductoPage() {
  const params = useParams();
  const id = Array.isArray((params as any)?.id)
    ? (params as any).id[0]
    : (params as any)?.id;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [rellenos, setRellenos] = useState<Opcion[]>([]);
  const [toppings, setToppings] = useState<Opcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErrorMsg("ID de producto no válido.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [
          productoRes,
          categoriasRes,
          rellenosRes,
          toppingsRes
        ] = await Promise.all([
          fetch(`/api/productos?id=${id}`, { cache: "no-store" }),
          fetch(`/api/categorias`, { cache: "no-store" }),
          fetch(`/api/relleno`, { cache: "no-store" }),
          fetch(`/api/toppings`, { cache: "no-store" })
        ]);

        if (!productoRes.ok) throw new Error("No se pudo obtener el producto.");

        const productoData = await productoRes.json();
        const categoriasData = await categoriasRes.json();
        const rellenosData = await rellenosRes.json();
        const toppingsData = await toppingsRes.json();

        const p: Producto | null = Array.isArray(productoData)
          ? (productoData[0] ?? null)
          : (productoData ?? null);

        setProducto(p);
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
        setRellenos(Array.isArray(rellenosData) ? rellenosData : []);
        setToppings(Array.isArray(toppingsData) ? toppingsData : []);

        if (!p) setErrorMsg("Producto no encontrado.");
      } catch (err: any) {
        console.error("❌ Error:", err);
        setErrorMsg(err.message || "Error al cargar el producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;
  if (!producto) return <p className="text-center mt-10">Producto no encontrado</p>;

  return (
    <div className="p-6 bg-white text-gray-800">
      <ProductDetail
        producto={producto}
        categorias={categorias}
        rellenos={rellenos}
        toppings={toppings}
      />
    </div>
  );
}