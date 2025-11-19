"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

function ConfirmPasswordContent() {
  const { showAlert } = useAlert();
  const { handlePasswordReset } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const alertRef = useRef(showAlert);
  const handledRef = useRef(false);

  useEffect(() => {
    alertRef.current = showAlert;
  }, [showAlert]);

  const tokenParam = searchParams.get("token");
  const typeParam = searchParams.get("type");
  const accessTokenParam = searchParams.get("access_token");
  const refreshTokenParam = searchParams.get("refresh_token");

  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleInvalidLink = (message: string) => {
    if (!handledRef.current) {
      handledRef.current = true;
      alertRef.current(message, "error");
    }
    router.replace("/views/forgotPassword");
  };

  useEffect(() => {
    let cancelled = false;

    const activateRecoverySession = async () => {
      setLoadingSession(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled && session?.user) {
        setSessionReady(true);
        setLoadingSession(false);
        return;
      }

      const hashParams =
        typeof window !== "undefined" && window.location.hash
          ? new URLSearchParams(window.location.hash.replace(/^#/, ""))
          : null;

      const flowType = typeParam ?? hashParams?.get("type");
      const hashAccessToken = hashParams?.get("access_token");
      const hashRefreshToken = hashParams?.get("refresh_token");
      const hashToken = hashParams?.get("token");

      const resolvedAccessToken =
        accessTokenParam ?? hashAccessToken ?? tokenParam ?? undefined;

      let resolvedRefreshToken =
        refreshTokenParam ?? hashRefreshToken ?? undefined;

      if (!resolvedRefreshToken && hashToken) {
        resolvedRefreshToken = hashToken;
      }
      if (!resolvedRefreshToken && tokenParam) {
        resolvedRefreshToken = tokenParam;
      }

      if (flowType !== "recovery") {
        handleInvalidLink("Tu enlace no corresponde a un flujo de recuperación.");
        return;
      }

      if (!resolvedAccessToken || !resolvedRefreshToken) {
        handleInvalidLink("El enlace de recuperación expiró o es inválido.");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: resolvedAccessToken,
        refresh_token: resolvedRefreshToken,
      });

      if (error) {
        console.error("setSession error", error);
        handleInvalidLink("No pudimos validar tu enlace de recuperación.");
        return;
      }

      if (!cancelled) {
        setSessionReady(true);
        setLoadingSession(false);
      }
    };

    activateRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [
    tokenParam,
    typeParam,
    accessTokenParam,
    refreshTokenParam,
    router,
  ]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      alertRef.current("La contraseña debe tener al menos 8 caracteres.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      alertRef.current("Las contraseñas no coinciden.", "warning");
      return;
    }

    if (!sessionReady) {
      alertRef.current(
        "Estamos validando tu enlace de recuperación. Intenta en unos segundos.",
        "warning"
      );
      return;
    }

    console.log("[ConfirmPassword] handleReset start");
    setUpdating(true);

    try {
      const { success, errorMessage } = await handlePasswordReset(password);
      console.log("[ConfirmPassword] handlePasswordReset result:", {
        success,
        errorMessage,
      });

      if (!success) {
        alertRef.current(
          errorMessage ?? "Error al actualizar la contraseña.",
          "error"
        );
        return;
      }

      alertRef.current("Contraseña actualizada correctamente.", "success");
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "global",
      });
      if (signOutError) {
        console.error("[ConfirmPassword] signOut error:", signOutError);
      } else {
        console.log("[ConfirmPassword] Sesión temporal cerrada.");
      }
      router.replace("/views/login");
    } catch (err) {
      console.error("[ConfirmPassword] handleReset error:", err);
      alertRef.current("No pudimos actualizar la contraseña.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f1ed] px-4">
      <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-full max-w-[420px] text-white">

        <h1 className="text-2xl font-semibold text-center mb-6">
          Restablecer contraseña
        </h1>

        <p className="text-sm text-center opacity-90 mb-6">
          Ingresa una nueva contraseña para tu cuenta.
        </p>

        {loadingSession && (
          <div className="text-center text-white/90">Validando enlace...</div>
        )}

        {!loadingSession && sessionReady && (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Contraseña nueva"
                className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repetir contraseña"
                className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
              />
            </div>

            <button
              type="submit"
              disabled={updating || !sessionReady}
              className="w-full bg-white text-[#C72C2F] font-semibold py-3 rounded-md shadow-lg hover:bg-red-500 hover:text-white active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
            >
              {updating ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPasswordView() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f8f1ed] px-4">
          <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-full max-w-[420px] text-white text-center">
            Cargando...
          </div>
        </div>
      }
    >
      <ConfirmPasswordContent />
    </Suspense>
  );
}
