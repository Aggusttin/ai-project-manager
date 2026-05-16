"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/proyectos");
    }
  }, [router]);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { access_token, user } = res.data;

      // 🔥 TOKEN
      localStorage.setItem(
        "token",
        access_token
      );

      // 🔥 USER COMPLETO
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // 🔥 ROL
      localStorage.setItem(
        "userRol",
        user.rol
      );

      toast.success(
        `Bienvenido ${user.nombre}`
      );

      // 🔥 REDIRECT
      router.push("/proyectos");
    } catch (err: any) {
      console.error("Error login:", err);

      toast.error(
        err?.response?.data?.message ||
          "Credenciales incorrectas"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Iniciar Sesión
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {/* BOTÓN */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-lg"
        >
          {loading
            ? "Ingresando..."
            : "Ingresar"}
        </button>

        {/* LINKS */}
        <div className="flex justify-between text-sm mt-4">
          <button
            onClick={() =>
              router.push(
                "/reset-password"
              )
            }
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button
            onClick={() =>
              router.push("/register")
            }
          >
            Registrate
          </button>
        </div>
      </div>
    </div>
  );
}