"use client";

import { useState } from "react";

interface Props {
  abierto: boolean;

  onClose: () => void;

  onGuardar: (data: any) => void;

  proyectoId?: number | null;
}

export default function UserStoryModal({
  abierto,
  onClose,
  onGuardar,
  proyectoId,
}: Props) {
  const [form, setForm] =
    useState({
      titulo: "",

      descripcion: "",

      prioridad: 2,

      puntos_historia: 1,
    });

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6">
        <h2 className="text-2xl font-black mb-6 text-black">
          Nueva User Story
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) =>
              setForm({
                ...form,
                titulo:
                  e.target.value,
              })
            }
            className="w-full border p-3 rounded-lg text-black"
          />

          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) =>
              setForm({
                ...form,
                descripcion:
                  e.target.value,
              })
            }
            className="w-full border p-3 rounded-lg text-black h-32"
          />

          <select
            value={form.prioridad}
            onChange={(e) =>
              setForm({
                ...form,
                prioridad:
                  Number(
                    e.target.value
                  ),
              })
            }
            className="w-full border p-3 rounded-lg text-black"
          >
            <option value={1}>
              Baja
            </option>

            <option value={2}>
              Media
            </option>

            <option value={3}>
              Alta
            </option>
          </select>

          <input
            type="number"
            placeholder="Story Points"
            value={
              form.puntos_historia
            }
            onChange={(e) =>
              setForm({
                ...form,
                puntos_historia:
                  Number(
                    e.target.value
                  ),
              })
            }
            className="w-full border p-3 rounded-lg text-black"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-lg bg-gray-200"
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onGuardar({
                ...form,
                proyectoId,
                estado: "BACKLOG",
              })
            }
            className="px-5 py-3 rounded-lg bg-blue-600 text-white"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}