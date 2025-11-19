"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Verification() {
  const router = useRouter();

  useEffect(() => {
    const handleVerification = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Error al verificar:", error.message);
        router.replace("/views/login");
        return;
      }

      await new Promise((r) => setTimeout(r, 2000));
      router.replace("/");
    };
    handleVerification();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#C72C2F] text-white">
      {/* Loader redondo */}
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
      <h1 className="text-xl font-semibold mb-1">Verificando tu cuenta...</h1>
      <p className="text-white/80">Esto tomará solo unos segundos ⏳</p>
    </div>
  );
}
