import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAlert } from "@/app/hooks/useAlert";

function ForgotComponent() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const commonDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com","duocuc.cl", "profesor.duoc.cl" , "duoc.cl"];
    const domain = email.split("@")[1];
    if (!domain || !commonDomains.includes(domain.toLowerCase())) {
      showAlert("Ingresa un correo con un dominio válido (ej. gmail.com, outlook.com).", "warning");
      return;
    }

    setSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      showAlert("❌ No pudimos enviar el correo. Intenta nuevamente.", "error");
    } else {
      showAlert("✅ Revisa tu correo para restablecer la contraseña.", "success");
      router.push("/views/wait");
    }

    setSending(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f1ed] px-4">
      <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-full max-w-[420px]">
        <h1 className="text-2xl font-semibold text-center text-white mb-6">
          Recuperar contraseña
        </h1>
        <p className="text-white/90 text-sm text-center mb-6">
          Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>
        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div>
            <label className="block text-white/90 text-sm mb-1">Correo</label>
            <input
              type="email"
              required
              placeholder="Ingresa tu correo..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                     border border-white/50 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-white text-[#C72C2F] font-semibold py-3 rounded-md
                   shadow-lg hover:bg-red-500 hover:text-white active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
          >
            {sending ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotComponent;
