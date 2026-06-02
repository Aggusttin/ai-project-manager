"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  clientesService,
  Cliente,
} from "@/services/clientes.service";

export function useClientes() {
  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchClientes = async () => {
    try {
      setLoading(true);

      const data =
        await clientesService.getAll();

      setClientes(data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Error cargando clientes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    setClientes,
    loading,
    fetchClientes,
  };
}