"use client";

interface Props {
  form: any;

  setForm: any;

  onSubmit: () => void;
}

export default function ClienteFormModal({
  form,
  setForm,
  onSubmit,
}: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8">
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Razón social"
          value={form.razon_social}
          onChange={(e) =>
            setForm({
              ...form,
              razon_social:
                e.target.value,
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
              telefono:
                e.target.value,
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
              direccion:
                e.target.value,
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
              provincia:
                e.target.value,
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
        onClick={onSubmit}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
      >
        Crear Cliente
      </button>
    </div>
  );
}