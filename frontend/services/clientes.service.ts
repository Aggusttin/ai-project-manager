import { api } from "@/lib/api";

export interface Cliente {
  id: number;

  razon_social: string;

  cuit: string;

  telefono: string;

  email: string;

  direccion: string;

  provincia: string;

  ciudad: string;

  activo: boolean;
}

export const clientesService = {
  // ======================================================
  // LISTAR CLIENTES
  // ======================================================

  async getAll(): Promise<Cliente[]> {
    const res = await api.get(
      "/clientes"
    );

    return res.data;
  },

  // ======================================================
  // CREAR CLIENTE
  // ======================================================

  async create(
    data: Partial<Cliente>
  ): Promise<Cliente> {
    const res = await api.post(
      "/clientes",
      data
    );

    return res.data;
  },

  // ======================================================
  // EDITAR CLIENTE
  // ======================================================

  async update(
    id: number,
    data: Partial<Cliente>
  ): Promise<Cliente> {
    const res = await api.patch(
      `/clientes/${id}`,
      data
    );

    return res.data;
  },

  // ======================================================
  // DESACTIVAR CLIENTE
  // ======================================================

  async deactivate(id: number) {
    const res = await api.patch(
      `/clientes/${id}/delete`
    );

    return res.data;
  },

  // ======================================================
  // REACTIVAR CLIENTE
  // ======================================================

  async restore(id: number) {
    const res = await api.patch(
      `/clientes/${id}/restore`
    );

    return res.data;
  },
};