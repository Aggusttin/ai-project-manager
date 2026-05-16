"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ClientesPage() {
  useAuth();

  const [clientes, setClientes] = useState<any[]>([]);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const fetchClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCrear = async () => {
    try {
      await api.post("/clientes", {
        razon_social: nombre,
        email,
      });

      toast.success("Cliente creado");

      setNombre("");
      setEmail("");

      fetchClientes();
    } catch (error) {
      toast.error("Error creando cliente");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <h1 className="text-3xl font-black mb-6">
        Clientes
      </h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <input
          placeholder="Razón social"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-3"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded-lg mb-3"
        />

        <button
          onClick={handleCrear}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Crear cliente
        </button>
      </div>

      <div className="space-y-4">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            <h3 className="font-bold">
              {cliente.razon_social}
            </h3>

            <p className="text-sm text-gray-500">
              {cliente.email}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Cliente {
  id: number;
  razon_social: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  provincia: string;
  ciudad: string;
}

export default function ClientesPage() {
  useAuth();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    razon_social: "",
    cuit: "",
    telefono: "",
    email: "",
    direccion: "",
    provincia: "",
    ciudad: "",
  });

  const fetchClientes = async () => {
    try {
      const res = await api.get("/clientes");

      setClientes(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (error) {
      console.error(error);
      toast.error("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCrearCliente = async () => {
    try {
      await api.post("/clientes", form);

      toast.success("Cliente creado");

      setForm({
        razon_social: "",
        cuit: "",
        telefono: "",
        email: "",
        direccion: "",
        provincia: "",
        ciudad: "",
      });

      fetchClientes();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Error creando cliente"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-black mb-8">
        Clientes
      </h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Razón social"
            value={form.razon_social}
            onChange={(e) =>
              setForm({
                ...form,
                razon_social: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="CUIT"
            value={form.cuit}
            onChange={(e) =>
              setForm({
                ...form,
                cuit: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) =>
              setForm({
                ...form,
                telefono: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) =>
              setForm({
                ...form,
                direccion: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Provincia"
            value={form.provincia}
            onChange={(e) =>
              setForm({
                ...form,
                provincia: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={(e) =>
              setForm({
                ...form,
                ciudad: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />
        </div>

        <button
          onClick={handleCrearCliente}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
        >
          Crear Cliente
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-4 text-left">
                Razón Social
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Teléfono
              </th>

              <th className="p-4 text-left">
                Ciudad
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center"
                >
                  Cargando...
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-bold">
                    {cliente.razon_social}
                  </td>

                  <td className="p-4">
                    {cliente.email}
                  </td>

                  <td className="p-4">
                    {cliente.telefono}
                  </td>

                  <td className="p-4">
                    {cliente.ciudad}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}}