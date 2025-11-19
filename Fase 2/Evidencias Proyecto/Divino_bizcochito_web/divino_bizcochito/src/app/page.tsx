"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Carousel from "./components/Carousel/Carousel";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/app/components/ProductCard/ProductCard";
import { useAlert } from "@/app/hooks/useAlert";
import ConfirmModal from "./components/ui/ConfirmModal";
import AcercaDe from "./components/AcercaDe/AcercaDe";
import RecetasCard from "./components/RecetasCard/RecetasCard";

interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Receta {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  categoria: string;
  imagenUrl: string;
  autorId: string;
  autor?: string;
}

export default function Home() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user, perfil } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Array<Producto>>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRecetas, setLoadingRecetas] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setDeleteProductId] = useState<string | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecetaId, setSelectedRecetaId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (perfil) {
      setIsAdmin(perfil.rol === "admin");
    }
  }, [perfil]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);

        // 🟢 Consulta a Supabase: ordena por ventas desc y limita a 4
        const { data, error } = await supabase
          .from("Producto")
          .select("*")
          .order("ventas", { ascending: false })
          .limit(4);

        if (error) throw error;

        // 🔒 Aseguramos que solo sean 4 elementos
        const top4 = Array.isArray(data) ? data.slice(0, 4) : [];

        setProductos(top4);
      } catch (err) {
        console.error("❌ Error al traer productos:", err);
        setProductos([]); // limpia si hay error
      } finally {
        setLoading(false);
      }
    };

    const fetchProductosCategoria = async () => {
      const responseCategorias = await fetch("/api/categorias");
      const dataCategorias = await responseCategorias.json();
      setCategorias(dataCategorias);
    };

    const fetchRecetas = async () => {
      try {
        setLoadingRecetas(true);
        const response = await fetch("/api/recetas");

        if (!response.ok) throw new Error("Error al cargar recetas");

        const data = await response.json();

        // Filtrar solo recetas publicadas
        const recetasPublicadas = Array.isArray(data) 
          ? data.filter((receta: Receta) => receta.estado === "publicada")
          : [];

        // Limitar a 4 recetas publicadas más recientes
        const top4Recetas = recetasPublicadas.slice(0, 4);

        setRecetas(top4Recetas);
      } catch (err) {
        console.error("❌ Error al traer recetas:", err);
        setRecetas([]);
      } finally {
        setLoadingRecetas(false);
      }
    };

    fetchProductosCategoria();
    fetchProductos();
    fetchRecetas();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/admin/productos/${id}`);
  };

  const handleEditReceta = (id: string) => {
    router.push(`/views/recetas/detalle/${id}`);
  };

  const handleDeleteReceta = (id: string) => {
    setSelectedRecetaId(id);
    setRecipeModalOpen(true);
  };

  const handleViewProduct = (id: string) => {
    router.push(`/views/producto/${id}`);
  };

  const handleViewReceta = (id: string) => {
    router.push(`/views/recetas/detalle/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteProductId(id);
    setModalOpen(true);
  };

  // 🧩 Función actualizada con manejo de FK y errores específicos
  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;

    try {
      const res = await fetch(`/api/productos?id=${selectedProductId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("foreign key constraint")) {
          showAlert(
            "❌ No se puede eliminar este producto porque está asociado a un pedido.",
            "error"
          );
        } else {
          throw new Error(data.error || "Error al eliminar producto");
        }
        return;
      }

      showAlert("✅ Producto eliminado correctamente", "success");

      // Actualiza la lista local
      setProductos((prev) =>
        prev.filter((p) => p.id !== selectedProductId)
      );
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      showAlert("❌ No se pudo eliminar el producto", "error");
    } finally {
      setModalOpen(false);
      setDeleteProductId(null);
    }
  };

  const handleConfirmDeleteReceta = async () => {
    if (!selectedRecetaId) return;

    try {
      const res = await fetch(`/api/recetas/${selectedRecetaId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar receta");
      }

      showAlert("✅ Receta eliminada correctamente", "success");
      setRecetas((prev) => prev.filter((receta) => receta.id !== selectedRecetaId));
    } catch (error) {
      console.error("❌ Error al eliminar receta:", error);
      showAlert("❌ No se pudo eliminar la receta", "error");
    } finally {
      setRecipeModalOpen(false);
      setSelectedRecetaId(null);
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  return (
    <main className="p-0 m-0">
      <Carousel />
      <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
        Productos destacados
      </h1>
      <div
        className="grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-2 
          lg:grid-cols-4 
          gap-8 
          justify-center 
          place-items-center 
          max-w-7xl 
          mx-auto
          px-4"
      >
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            nombre={producto.nombre}
            categoriaId={
              categorias.find((cat) => cat.id === producto.categoriaId)
                ?.nombre || "Sin categoría"
            }
            precio={producto.precio}
            descripcion={producto.descripcion}
            imagen={producto.imagen}
            onEdit={() => handleEdit(producto.id)}
            onDelete={() => handleDeleteClick(producto.id)}
            onViewRecipe={() => handleViewProduct(producto.id)}
          />
        ))}
      </div>
      <div>
        <AcercaDe />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
          Recetas populares
        </h1>
        {loadingRecetas ? (
          <p className="text-center">Cargando recetas...</p>
        ) : (
          <div
            className="grid 
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
              mb-8"
          >
            {recetas.map((receta) => (
              <RecetasCard
                key={receta.id}
                id={receta.id}
                titulo={receta.titulo}
                categoria={receta.categoria}
                autorId={receta.autorId}
                autor={receta.autor}
                descripcion={receta.descripcion}
                imagen={receta.imagenUrl}
                onEdit={() => handleEditReceta(receta.id)}
                onDelete={() => handleDeleteReceta(receta.id)}
                onView={() => handleViewReceta(receta.id)}
                isAdmin={isAdmin}
                isOwner={receta.autorId === perfil?.id}
              />
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={modalOpen}
        title="Eliminar producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setModalOpen(false);
          setDeleteProductId(null);
        }}
      />
      <ConfirmModal
        isOpen={recipeModalOpen}
        title="Eliminar receta"
        message="¿Deseas eliminar esta receta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteReceta}
        onCancel={() => {
          setRecipeModalOpen(false);
          setSelectedRecetaId(null);
        }}
      />
    </main>
  );
}
