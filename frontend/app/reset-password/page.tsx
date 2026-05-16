'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // 1. Importamos toast

export default function ResetPasswordPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  // 🔹 PASO 1: Solicitar código
  const handleRequest = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Error al solicitar el código');

      toast.success('Código enviado. Revisá tu casilla de correo.');
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 🔹 PASO 2: Validar código
  const handleValidate = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/validate-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Código inválido');

      toast.success('Código verificado con éxito');
      setStep(3);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 🔹 PASO 3: Resetear contraseña
  const handleReset = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'No se pudo actualizar la contraseña');

      toast.success('¡Contraseña actualizada! Redirigiendo...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border-t-4 border-blue-600">
        <h1 className="text-2xl font-black mb-6 text-center text-gray-800 uppercase tracking-tight">
          Recuperar Cuenta
        </h1>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Ingresá tu email para recibir el código.</p>
            <input
              type="email"
              placeholder="Tu email de registro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-gray-100 px-3 py-2 w-full rounded-lg text-black focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 w-full rounded-lg shadow-md transition-all active:scale-95"
            >
              Enviar código
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Ingresá el código de 6 dígitos.</p>
            <input
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="border-2 border-gray-100 px-3 py-2 w-full rounded-lg text-black text-center text-xl tracking-[10px] focus:border-yellow-500 outline-none"
            />
            <button
              onClick={handleValidate}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 w-full rounded-lg shadow-md transition-all active:scale-95"
            >
              Validar código
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Elegí tu nueva contraseña.</p>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="border-2 border-gray-100 px-3 py-2 w-full rounded-lg text-black focus:border-green-500 outline-none"
            />
            <button
              onClick={handleReset}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 w-full rounded-lg shadow-md transition-all active:scale-95"
            >
              Actualizar contraseña
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/login')}
              className="text-gray-400 text-xs hover:text-blue-500 transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
        </div>
      </div>
    </div>
  );
}