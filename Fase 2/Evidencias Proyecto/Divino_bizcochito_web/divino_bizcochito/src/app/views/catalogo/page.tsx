"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "@/app/components/ProductCard/ProductCard";
import { useAlert } from "@/app/hooks/useAlert";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaPlus } from "react-icons/fa";

interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  toppingId?: string;
  rellenoId?: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

interface SimpleOption {
  id: string;
  nombre: string;
}

function CatalogoPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { perfil } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<SimpleOption[]>([]);
  const [toppings, setToppings] = useState<SimpleOption[]>([]);
  const [rellenos, setRellenos] = useState<SimpleOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setDeleteProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [toppingFiltro, setToppingFiltro] = useState<string>("todos");
  const [rellenoFiltro, setRellenoFiltro] = useState<string>("todos");

  useEffect(() => {
    const fetchProductosCategoria = async () => {
      const [responseProductos, responseCategorias, responseToppings, responseRellenos] =
        await Promise.all([
          fetch("/api/productos"),
          fetch("/api/categorias"),
          fetch("/api/toppings"),
          fetch("/api/relleno"),
        ]);

      const data = await responseProductos.json();
      setProductos(data);

      const dataCategorias = await responseCategorias.json();
      setCategorias(dataCategorias);

      const dataToppings = await responseToppings.json();
      setToppings(dataToppings);

      const dataRellenos = await responseRellenos.json();
      setRellenos(dataRellenos);
    };


    fetchProductosCategoria();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/admin/productos/${id}`);
  };
  const handleViewProduct = (id: string) => {
    router.push(`/views/producto/${id}`);

  };

  const handleDeleteClick = (id: string) => {
    setDeleteProductId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;

    try {
      const res = await fetch(`/api/productos?id=${selectedProductId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar producto");

      showAlert("✅ Producto eliminado correctamente", "success");

      setProductos((prev) => prev.filter((p) => p.id !== selectedProductId));
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      showAlert("❌ No se pudo eliminar el producto", "error");
    } finally {
      setModalOpen(false);
      setDeleteProductId(null);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria =
      categoriaFiltro === "todos" || String(p.categoriaId) === categoriaFiltro;
    const matchTopping =
      toppingFiltro === "todos" || String(p.toppingId) === toppingFiltro;
    const matchRelleno =
      rellenoFiltro === "todos" || String(p.rellenoId) === rellenoFiltro;
    return matchCategoria && matchTopping && matchRelleno;
  });

  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const productosPagina = productosFiltrados.slice(startIndex, startIndex + PAGE_SIZE);

  const categoriaMap = useMemo(() => {
    const map = new Map<string, string>();
    categorias.forEach((cat) => map.set(String(cat.id), cat.nombre));
    return map;
  }, [categorias]);

  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold text-[#C72C2F] text-center mb-8">
        Catálogo de Productos
      </h1>

      <div className="flex flex-wrap justify-end gap-4 mb-6">
        <select
          value={categoriaFiltro}
          onChange={(e) => {
            setCategoriaFiltro(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="todos">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <select
          value={toppingFiltro}
          onChange={(e) => {
            setToppingFiltro(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="todos">Todos los toppings</option>
          {toppings.map((top) => (
            <option key={top.id} value={top.id}>
              {top.nombre}
            </option>
          ))}
        </select>
        <select
          value={rellenoFiltro}
          onChange={(e) => {
            setRellenoFiltro(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="todos">Todos los rellenos</option>
          {rellenos.map((rel) => (
            <option key={rel.id} value={rel.id}>
              {rel.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* 🧱 Grid de productos */}
      <div className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-2 
    lg:grid-cols-4 
    gap-8 
    justify-center 
    place-items-center 
    max-w-7xl 
    mx-auto
    px-4
  ">
        {productosPagina.map((producto) => (
          <ProductCard
            key={producto.id}
            nombre={producto.nombre}
            categoriaId={categoriaMap.get(String(producto.categoriaId)) || 'Sin categoría'}
            precio={producto.precio}
            descripcion={producto.descripcion}
            imagen={producto.imagen}
            onEdit={() => handleEdit(producto.id)}
            onDelete={() => handleDeleteClick(producto.id)}
            onViewRecipe={() => handleViewProduct(producto.id)}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Eliminar producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
      />
      {productosFiltrados.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-60"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>
      )}
      {perfil?.rol === "admin" && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/admin/productos/crear")}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer"
            title="Agregar producto"
          >
            <FaPlus size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

export default CatalogoPage;
