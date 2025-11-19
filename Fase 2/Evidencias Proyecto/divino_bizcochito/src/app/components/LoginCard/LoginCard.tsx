"use client";
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAlert } from "@/app/hooks/useAlert";

function LoginCard() {

    const router = useRouter();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) router.push("/");
        else showAlert("❌ " + ("Usuario / contraseña incorrectos."), "error");

    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-[420px]">
                <h1 className="text-2xl font-semibold text-center text-white mb-8">
                    Iniciar sesión
                </h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-white/90 text-sm mb-1">Correo</label>
                        <input
                            type="email"
                            placeholder="Ingresar correo..."
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-transparent
                         autofill:shadow-[inset_0_0_0_1000px_white]"
                        />
                    </div>

                    <div>
                        <label className="block text-white/90 text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            placeholder="Ingresar contraseña..."
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-transparent
                         autofill:shadow-[inset_0_0_0_1000px_white]"
                        />
                    </div>

                    <p className="text-sm text-white/90 -mt-1">
                        ¿Ya tienes cuenta?{" "}
                        <a href="/views/registro" className="underline text-orange-950 hover:text-white/90">
                            Regístrate.
                        </a>
                    </p>
                    <p className="text-sm text-white/90 -mt-1">
                        ¿Olvidaste tu contraseña?{" "}
                        <a href="/views/forgotPassword" className="underline text-orange-950 hover:text-white/90">
                            recuperar contraseña.
                        </a>
                    </p>

                    <button
                        type="submit"
                        className="w-full bg-white text-[#C72C2F] font-semibold py-3 rounded-md
                       shadow-lg hover:bg-red-500 hover:text-white active:scale-[0.99] transition cursor-pointer"
                    >
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </div>

    )
}

export default LoginCard
