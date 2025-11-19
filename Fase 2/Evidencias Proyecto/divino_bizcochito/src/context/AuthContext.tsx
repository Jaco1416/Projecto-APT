"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Perfil {
  id: string;
  nombre: string;
  rol: "admin" | "cliente";
  imagen: string;
  telefono: string;
}

interface PasswordResetResult {
  success: boolean;
  errorMessage?: string;
}

interface AuthContextType {
  user: any | null;
  perfil: Perfil | null;
  loading: boolean;
  handleLogout: () => Promise<void>;
  handlePasswordReset: (password: string) => Promise<PasswordResetResult>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  handleLogout: async () => {},
  handlePasswordReset: async () => ({ success: false }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ---------------------------------------------------------------------
  // 🔹 Obtener perfil en la base de datos
  // ---------------------------------------------------------------------
  const fetchPerfil = async (userId: string) => {
    const { data, error } = await supabase
      .from("Perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error al obtener perfil:", error);
      return null;
    }
    return data;
  };

  // ---------------------------------------------------------------------
  // 🔹 Cargar sesión inicial
  // ---------------------------------------------------------------------
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // ⚠ Si es una sesión de recuperación → NO cargar perfil
      if (session?.user?.recovery_sent_at) {
        console.log("[AuthContext] Sesión temporal (recovery).");
        setUser(null);
        setPerfil(null);
        setLoading(false);
        return;
      }

      // Sesión normal
      if (session?.user) {
        const perfilData = await fetchPerfil(session.user.id);
        setUser(session.user);
        setPerfil(perfilData);
      }

      setLoading(false);
    };

    initialize();

    // ---------------------------------------------------------------------
    // 🔹 Detectar eventos de autenticación
    // ---------------------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] event:", event);

      // 1️⃣ Si entra en modo recovery → redirigir
      if (event === "PASSWORD_RECOVERY") {
        console.log("[AuthContext] PASSWORD_RECOVERY → /views/confirmPassword");
        setUser(null);
        setPerfil(null);
        setLoading(false);
        router.replace("/views/confirmPassword");
        return;
      }
      if (event === "USER_UPDATED") {
        console.log("[AuthContext] USER_UPDATED → /views/confirmPassword");
        setUser(null);
        setPerfil(null);
        setLoading(false);
        router.replace("/views/login");
        return;
      }

      // 2️⃣ Ignorar sesiones temporales
      if (session?.user?.recovery_sent_at) {
        console.log("[AuthContext] Sesión temporal ignorada.");
        setUser(null);
        setPerfil(null);
        setLoading(false);
        return;
      }

      // 3️⃣ Manejo normal
      if (session?.user) {
        setUser(session.user);
        const perfilData = await fetchPerfil(session.user.id);
        setPerfil(perfilData);
      } else {
        setUser(null);
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------------------------------------------------------------------
  // 🔹 Cerrar sesión
  // ---------------------------------------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
    router.push("/views/login");
  };

  // ---------------------------------------------------------------------
  // 🔹 Actualizar contraseña (confirmar nueva)
  // ---------------------------------------------------------------------
  const handlePasswordReset = async (
    newPassword: string
  ): Promise<PasswordResetResult> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("❌ Error al actualizar contraseña:", error);
      return { success: false, errorMessage: error.message };
    }

    return { success: true };
  };

  // ---------------------------------------------------------------------
  // 🔹 Context Provider
  // ---------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        loading,
        handleLogout,
        handlePasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
