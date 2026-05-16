"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  // 🔥 VALIDACIONES PASSWORD
  const validations = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password),
    match:
      form.password.length > 0 &&
      form.password === form.repeatPassword,
  };

  // 🔥 VALIDACIÓN GENERAL
  const isFormComplete =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.username.trim() !== "" &&
    form.email.trim() !== "";

  const isValid =
    Object.values(validations).every(Boolean) && isFormComplete;

  const handleRegister = async () => {
    try {
      if (!isValid) {
        return toast.error(
          "Completá todos los campos y verificá la contraseña"
        );
      }

      await api.post("/auth/register", {
        nombre: form.nombre,
        apellido: form.apellido,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      toast.success(
        "Usuario creado correctamente. Revisá tu email."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.message ||
        "Error al registrar usuario";

      if (Array.isArray(message)) {
        toast.error(message.join(" - "));
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-black mb-8 text-center text-gray-900">
          Crear cuenta
        </h1>

        {/* NOMBRE Y APELLIDO */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Apellido"
            value={form.apellido}
            onChange={(e) =>
              setForm({ ...form, apellido: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* USERNAME */}
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="w-full mb-3 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full mb-3 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PASSWORD */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 text-sm font-semibold text-gray-500 hover:text-blue-600"
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </div>

        {/* REPEAT PASSWORD */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Repetir Password"
          value={form.repeatPassword}
          onChange={(e) =>
            setForm({
              ...form,
              repeatPassword: e.target.value,
            })
          }
          className="w-full mb-5 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* CHECKLIST */}
        <div className="mb-6 text-sm space-y-2">
          <p
            className={
              validations.length
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {validations.length ? "✔" : "✖"} Mínimo 8 caracteres
          </p>

          <p
            className={
              validations.upper
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {validations.upper ? "✔" : "✖"} Una mayúscula
          </p>

          <p
            className={
              validations.lower
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {validations.lower ? "✔" : "✖"} Una minúscula
          </p>

          <p
            className={
              validations.number
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {validations.number ? "✔" : "✖"} Un número
          </p>

          <p
            className={
              validations.symbol
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {validations.symbol ? "✔" : "✖"} Un símbolo
          </p>

          <p
            className={
              validations.match
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {validations.match ? "✔" : "✖"} Las contraseñas coinciden
          </p>
        </div>

        {/* BOTÓN */}
        <button
          disabled={!isValid}
          onClick={handleRegister}
          className={`w-full p-3 rounded-xl text-white font-bold transition-all ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Crear cuenta
        </button>

        {/* LINK LOGIN */}
        <p className="text-sm mt-6 text-center text-gray-700">
          ¿Ya tenés cuenta?{" "}
          <span
            className="text-blue-600 cursor-pointer font-semibold hover:underline"
            onClick={() => router.push("/login")}
          >
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}