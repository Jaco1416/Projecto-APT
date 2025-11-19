"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  to?: string;
}

export default function BackButton({ label = "Volver", to }: BackButtonProps) {
  const router = useRouter();

  const handleback = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleback}
      className="flex items-center gap-2 bg-[#C72C2F] text-white font-medium px-5 py-2 rounded-lg shadow-md hover:bg-[#A92225] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#530708] m-5"
    >
      <ArrowLeft className="w-5 h-5" />
      {label}
    </button>
  );
}
