"use client";

import { useEffect, useState } from "react";

import {
  userStoriesService,
  UserStory,
} from "@/services/userStories.service";

import { toast } from "sonner";

export function useUserStories(
  proyectoId?: number,
) {
  const [historias, setHistorias] =
    useState<UserStory[]>([]);

  const [loading, setLoading] =
    useState(false);

  // ==================================================
  // CARGAR
  // ==================================================

  const cargarHistorias =
    async () => {
      if (!proyectoId) return;

      try {
        setLoading(true);

        const data =
          await userStoriesService.getByProyecto(
            proyectoId,
          );

        setHistorias(data);
      } catch (error) {
        console.error(error);

        toast.error(
          "Error cargando historias",
        );
      } finally {
        setLoading(false);
      }
    };

  // ==================================================
  // CREAR
  // ==================================================

  const crearHistoria =
    async (
      data: Partial<UserStory>,
    ) => {
      try {
        await userStoriesService.create(
          data,
        );

        toast.success(
          "Historia creada",
        );

        await cargarHistorias();
      } catch (error) {
        console.error(error);

        toast.error(
          "Error creando historia",
        );
      }
    };

  // ==================================================
  // UPDATE
  // ==================================================

  const actualizarHistoria =
    async (
      id: number,
      data: Partial<UserStory>,
    ) => {
      try {
        await userStoriesService.update(
          id,
          data,
        );

        await cargarHistorias();
      } catch (error) {
        console.error(error);

        toast.error(
          "Error actualizando historia",
        );
      }
    };

  // ==================================================
  // DELETE
  // ==================================================

  const eliminarHistoria =
    async (id: number) => {
      try {
        await userStoriesService.remove(
          id,
        );

        toast.success(
          "Historia eliminada",
        );

        await cargarHistorias();
      } catch (error) {
        console.error(error);

        toast.error(
          "Error eliminando historia",
        );
      }
    };

  useEffect(() => {
    cargarHistorias();
  }, [proyectoId]);

  return {
    historias,

    loading,

    crearHistoria,

    actualizarHistoria,

    eliminarHistoria,

    recargar:
      cargarHistorias,
  };
}