"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  activo: boolean;
  rol?: {
    nombre: string;
  };
}

export default function UsuariosPage() {
  useAuth();

  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user?.rol !== "superadmin") {
        router.push("/proyectos");
        return;
      }

      const res = await api.get("/usuarios");

      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const toggleEstadoUsuario = async (
    id: number,
    estadoActual: boolean
  ) => {
    try {
      const accion = estadoActual ? "delete" : "restore";

      await api.patch(`/usuarios/${id}/${accion}`);

      toast.success(
        estadoActual
          ? "Usuario desactivado"
          : "Usuario restaurado"
      );

      fetchUsuarios();
    } catch (error) {
      toast.error("No se pudo actualizar el usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-purple-700">
            Gestión de Usuarios
          </h1>

          <p className="text-gray-500 text-sm">
            Administración global del sistema
          </p>
        </div>

        <button
          onClick={() => router.push("/proyectos")}
          className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-black"
        >
          ← Volver
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-4 text-left">Usuario</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Rol</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-10"
                >
                  Cargando usuarios...
                </td>
              </tr>
            ) : (
              usuarios.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b hover:bg-gray-50 ${
                    !user.activo && "bg-red-50"
                  }`}
                >
                  <td className="p-4">
                    <div className="font-bold">
                      {user.nombre} {user.apellido}
                    </div>

                    <div className="text-xs text-purple-600">
                      @{user.username}
                    </div>
                  </td>

                  <td className="p-4">{user.email}</td>

                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {user.rol?.nombre || "Sin rol"}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {user.activo ? (
                      <span className="text-green-600 font-bold text-xs">
                        ACTIVO
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold text-xs">
                        INACTIVO
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        toggleEstadoUsuario(
                          user.id,
                          user.activo
                        )
                      }
                      className={`px-4 py-2 rounded-lg text-white text-xs font-bold ${
                        user.activo
                          ? "bg-red-500 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {user.activo
                        ? "DESACTIVAR"
                        : "RESTAURAR"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}