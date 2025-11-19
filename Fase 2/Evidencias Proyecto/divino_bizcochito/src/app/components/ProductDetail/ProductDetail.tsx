"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

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
  // Campos opcionales para precarga
  toppingId?: number | null;
  rellenoId?: number | null;
  toppingNombre?: string | null;
  rellenoNombre?: string | null;
}

interface ProductDetailProps {
  producto: Producto;
  categorias: Categoria[];
  rellenos: Opcion[];
  toppings: Opcion[];
}

export default function ProductDetail({
  producto,
  categorias,
  rellenos,
  toppings,
}: ProductDetailProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [toppingSeleccionado, setToppingSeleccionado] = useState<number | null>(null);
  const [rellenoSeleccionado, setRellenoSeleccionado] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [mensaje, setMensaje] = useState<string>("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Precarga de topping y relleno:
  useEffect(() => {
    // Prioridad: usar IDs directos si existen
    if (producto.toppingId != null) {
      setToppingSeleccionado(producto.toppingId);
    } else if (producto.toppingNombre) {
      const encontradoT = toppings.find(
        (t) => t.nombre.toLowerCase() === producto.toppingNombre!.toLowerCase()
      );
      if (encontradoT) setToppingSeleccionado(encontradoT.id);
    }

    if (producto.rellenoId != null) {
      setRellenoSeleccionado(producto.rellenoId);
    } else if (producto.rellenoNombre) {
      const encontradoR = rellenos.find(
        (r) => r.nombre.toLowerCase() === producto.rellenoNombre!.toLowerCase()
      );
      if (encontradoR) setRellenoSeleccionado(encontradoR.id);
    }
  }, [producto, toppings, rellenos]);

  const categoriaNombre =
    categorias.find((cat) => cat.id === producto.categoriaId)?.nombre || "Sin categoría";

  const total = producto.precio * cantidad;

  const handleCantidadChange = (value: number) => {
    if (value < 1) return;
    setCantidad(value);
  };

  const validarSeleccion = () => {
    if (!toppingSeleccionado || !rellenoSeleccionado) {
      alert("Por favor selecciona un topping y un relleno antes de continuar.");
      return false;
    }
    return true;
  };

  const handleAgregarPedido = () => {
    if (!user) {
      router.push("/views/login");
      return;
    }
    if (!validarSeleccion()) return;
    setMostrarConfirmacion(true);
  };

  const confirmarAgregarPedido = () => {
    const nuevoPedido = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      categoriaId: producto.categoriaId,
      toppingId: toppingSeleccionado,
      rellenoId: rellenoSeleccionado,
      cantidad,
      mensaje,
      total,
    };

    const pedidosGuardados = JSON.parse(localStorage.getItem("carrito") || "[]");

    const productoExistente = pedidosGuardados.find(
      (p: any) =>
        p.id === nuevoPedido.id &&
        p.toppingId === nuevoPedido.toppingId &&
        p.rellenoId === nuevoPedido.rellenoId
    );

    if (productoExistente) {
      productoExistente.cantidad += nuevoPedido.cantidad;
      productoExistente.total += nuevoPedido.total;
    } else {
      pedidosGuardados.push(nuevoPedido);
    }

    localStorage.setItem("carrito", JSON.stringify(pedidosGuardados));

    alert("Producto agregado al carrito 🛒");
    setMostrarConfirmacion(false);
  };

  if (loading) {
    return <p className="text-center py-10">Validando sesión...</p>;
  }

  if (!producto || !categorias.length || !rellenos.length || !toppings.length) {
    return <p className="text-center py-10">Cargando datos del producto...</p>;
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-8 p-8">
      {/* Imagen y datos básicos */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">{producto.nombre}</h1>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full max-w-md rounded-lg shadow-lg mb-4"
        />
        <p className="text-lg text-gray-700 mb-2">
          <span className="font-bold text-red-700">Categoría:</span> {categoriaNombre}
        </p>
        <p className="text-gray-700 text-justify">{producto.descripcion}</p>
      </div>

      {/* Formulario de selección */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        {/* Topping */}
        <div>
          <label className="block font-semibold mb-1">Topping</label>
          <select
            className="w-full border rounded-md p-2"
            value={toppingSeleccionado ?? ""}
            onChange={(e) => setToppingSeleccionado(Number(e.target.value))}
          >
            <option value="">Seleccione un topping</option>
            {toppings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Relleno */}
        <div>
          <label className="block font-semibold mb-1">Relleno</label>
            <select
              className="w-full border rounded-md p-2"
              value={rellenoSeleccionado ?? ""}
              onChange={(e) => setRellenoSeleccionado(Number(e.target.value))}
            >
              <option value="">Seleccione un relleno</option>
              {rellenos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
        </div>

        {/* Mensaje personalizado */}
        <div>
          <label className="block font-semibold mb-1">Mensaje personalizado</label>
          <textarea
            className="w-full border rounded-md p-2"
            rows={3}
            placeholder="Inserte su mensaje personalizado"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
        </div>

        {/* Cantidad y total */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block font-semibold mb-1">Cantidad</label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => handleCantidadChange(Number(e.target.value))}
              className="w-20 text-center border rounded-md p-2"
            />
          </div>

           <div className="text-lg font-semibold text-red-600">
            Total: ${total.toLocaleString("es-CL")}
          </div>
        </div>

        {/* Botón agregar */}
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg mt-4 cursor-pointer"
          onClick={handleAgregarPedido}
        >
          Agregar pedido
        </button>
      </div>

      <ConfirmModal
        isOpen={mostrarConfirmacion}
        title="Agregar al carrito"
        message={`¿Deseas agregar ${cantidad} unidad(es) de "${producto.nombre}" al carrito?`}
        confirmText="Sí, agregar"
        cancelText="Cancelar"
        onConfirm={confirmarAgregarPedido}
        onCancel={() => setMostrarConfirmacion(false)}
      />
    </div>
  );
}