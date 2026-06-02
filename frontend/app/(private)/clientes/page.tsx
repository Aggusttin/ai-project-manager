"use client";

import { useState } from "react";

import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

import {
  clientesService,
} from "@/services/clientes.service";

import { useClientes } from "@/hooks/useClientes";

import ClientesTable from "@/components/clientes/ClientesTable";

import ClienteFormModal from "@/components/clientes/ClienteFormModal";

import ClienteFilters from "@/components/clientes/ClienteFilters";

export default function ClientesPage() {
  useAuth();

  const {
    clientes,
    fetchClientes,
  } = useClientes();

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState({
      razon_social: "",
      cuit: "",
      telefono: "",
      email: "",
      direccion: "",
      provincia: "",
      ciudad: "",
    });

  const handleCrear = async () => {
    try {
      await clientesService.create(form);

      toast.success(
        "Cliente creado"
      );

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
    } catch (error) {
      console.error(error);

      toast.error(
        "Error creando cliente"
      );
    }
  };

  const handleDeactivate =
    async (id: number) => {
      try {
        await clientesService.deactivate(
          id
        );

        toast.success(
          "Cliente desactivado"
        );

        fetchClientes();
      } catch {
        toast.error(
          "Error desactivando"
        );
      }
    };

  const handleRestore =
    async (id: number) => {
      try {
        await clientesService.restore(
          id
        );

        toast.success(
          "Cliente reactivado"
        );

        fetchClientes();
      } catch {
        toast.error(
          "Error reactivando"
        );
      }
    };

  const filteredClientes =
    clientes.filter((cliente) =>
      cliente.razon_social
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-black mb-8">
        Clientes
      </h1>

      <ClienteFilters
        search={search}
        setSearch={setSearch}
      />

      <ClienteFormModal
        form={form}
        setForm={setForm}
        onSubmit={handleCrear}
      />

      <ClientesTable
        clientes={filteredClientes}
        onDeactivate={
          handleDeactivate
        }
        onRestore={handleRestore}
      />
    </div>
  );
}