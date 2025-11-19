"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAlert } from "@/app/hooks/useAlert";

export default function RegistroForm() {

    const { showAlert } = useAlert();
    const router = useRouter();

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [telefono, setTelefono] = useState("+56 9 ");
    const [correo, setCorreo] = useState("");
    const [errores, setErrores] = useState<{ [key: string]: string }>({});
    const [mensaje, setMensaje] = useState("");

    // 📧 Validar correo con dominios permitidos
    const validarCorreo = (email: string) => {
        const dominiosPermitidos = [
            "gmail.com",
            "hotmail.com",
            "outlook.com",
            "yahoo.com",
            "live.com",
            "duoc.cl",
            "duocuc.cl",
            "usach.cl",
            "puc.cl",
            "uchile.cl",
            "inacapmail.cl",
            "divinobizcochito.cl", // 👈 tu dominio corporativo
        ];

        const regexBase = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
        const match = email.match(regexBase);
        if (!match) return false;

        const dominio = match[1].toLowerCase();
        return dominiosPermitidos.includes(dominio);
    };

    // 📞 Validar formato chileno +56 9 1234 5678
    const validarTelefono = (t: string) => /^\+56\s9\s\d{4}\s\d{4}$/.test(t);

    // 🔢 Formatear el teléfono en tiempo real
    const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Asegurar prefijo fijo
        if (!value.startsWith("+56 9")) {
            value = "+56 9 ";
        }

        // Mantener solo números
        let numeros = value.replace(/\D/g, "").replace(/^569/, "");
        numeros = numeros.slice(0, 8); // máximo 8 dígitos

        // Agregar espacio cada 4 números (1234 5678)
        let formateado = "";
        if (numeros.length > 4) {
            formateado = `${numeros.slice(0, 4)} ${numeros.slice(4)}`;
        } else {
            formateado = numeros;
        }

        setTelefono(`+56 9 ${formateado}`.trimEnd());
    };

    // 🧩 Enviar datos a Supabase
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensaje("");
        const nuevosErrores: { [key: string]: string } = {};

        // Validaciones front-end
        if (!validarCorreo(correo)) {
            nuevosErrores.correo =
                "Debe ingresar un correo con dominio permitido (ej: gmail.com, hotmail.com, divinobizcochito.cl).";
        }
        if (password.length < 8) {
            nuevosErrores.password = "La contraseña debe tener al menos 8 caracteres.";
        }
        if (password !== confirmarPassword) {
            nuevosErrores.confirmarPassword = "Las contraseñas no coinciden.";
        }
        if (!validarTelefono(telefono)) {
            nuevosErrores.telefono = "Formato inválido. Ej: +56 9 1234 5678";
        }

        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        // 🔐 Registro en Supabase con verificación de correo
        const { data, error } = await supabase.auth.signUp({
            email: correo,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/views/verification`, // página a la que vuelve tras confirmar
                data: {
                    full_name: usuario, // se guarda en raw_user_meta_data
                    telefono: telefono, // también disponible en raw_user_meta_data
                },
            },
        });

        if (error) {
            console.error(error);
            showAlert("❌ Error al registrar usuario.", "error");
            return;
        }
        
        showAlert("✅ Registro exitoso. Verifica tu correo.", "success");
        router.push("/views/wait");
        
    };

    return (
        <div className="flex items-center justify-center py-20">
            <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-[400px]">
                <h1 className="text-2xl font-semibold text-center text-white mb-8">
                    Registro
                </h1>

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    {/* Nombre */}
                    <div>
                        <label className="block text-white/90 text-sm mb-1">Nombre</label>
                        <input
                            type="text"
                            placeholder="Ingresar nombre"
                            value={usuario}
                            required
                            onChange={(e) => setUsuario(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-white/90 text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            placeholder="EJ: 123456789As+"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                        {errores.password && (
                            <p className="text-sm text-yellow-200 mt-1">{errores.password}</p>
                        )}
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label className="block text-white/90 text-sm mb-1">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Repetir contraseña"
                            value={confirmarPassword}
                            required
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                        {errores.confirmarPassword && (
                            <p className="text-sm text-yellow-200 mt-1">
                                {errores.confirmarPassword}
                            </p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-white/90 text-sm mb-1">
                            Número de teléfono
                        </label>
                        <input
                            type="tel"
                            placeholder="+56 9 1234 5678"
                            value={telefono}
                            required
                            onChange={handleTelefonoChange}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                        {errores.telefono && (
                            <p className="text-sm text-yellow-200 mt-1">{errores.telefono}</p>
                        )}
                    </div>

                    {/* Correo */}
                    <div>
                        <label className="block text-white/90 text-sm mb-1">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="EJ: divinobizcochito@gmail.com"
                            value={correo}
                            required
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                        {errores.correo && (
                            <p className="text-sm text-yellow-200 mt-1">{errores.correo}</p>
                        )}
                    </div>

                    {/* Link a login */}
                    <p className="text-sm text-white/90 -mt-1">
                        ¿Ya tienes cuenta?{" "}
                        <a
                            href="/views/login"
                            className="underline text-white hover:text-amber-950"
                        >
                            Inicia sesión.
                        </a>
                    </p>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="w-full bg-white text-[#C72C2F] font-semibold py-3 rounded-md shadow-lg hover:bg-red-500 hover:text-white transition"
                    >
                        Registrarte
                    </button>

                    {mensaje && (
                        <p className="text-sm text-center text-white/90 mt-4">{mensaje}</p>
                    )}
                </form>
            </div>
        </div>
    );
}
