"use client";

import Image from "next/image";
import React from "react";
import { Mail, Phone } from "lucide-react";

interface PerfilCardProps {
  nombre: string;
  rol: string;
  email: string;
  telefono: string;
  imagen: string;
  onEditar?: () => void;
}

export default function PerfilCard({
  nombre,
  rol,
  email,
  telefono,
  imagen,
  onEditar,
}: PerfilCardProps) {
  return (
    <div className="max-w-sm mx-auto my-10 bg-[#EDE2D3] border border-[#530708] rounded-xl p-6 shadow-sm">
      {/* Imagen */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
          <Image
            src={imagen}
            alt={`Foto de perfil de ${nombre}`}
            width={128}
            height={128}
            unoptimized
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Nombre y rol */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{nombre}</h2>
        <p className="text-gray-600">{rol}</p>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <Mail className="w-5 h-5 text-red-600" />
        <span>{email}</span>
      </div>

      {/* Teléfono */}
      <div className="flex items-center gap-2 text-gray-700 mb-6">
        <Phone className="w-5 h-5 text-red-600" />
        <span>{telefono}</span>
      </div>

      {/* Botón editar */}
      <div className="text-center">
        <button
          onClick={onEditar}
          className="bg-[#B21E1E] hover:bg-[#8B1515] text-white font-medium py-2 px-5 rounded-lg transition-colors cursor-pointer"
        >
          Editar perfil
        </button>
      </div>
    </div>
  );
}
