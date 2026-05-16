type ProyectoFormModalProps = {
  visible: boolean;
  nombre: string;
  setNombre: (value: string) => void;
  editandoId: number | null;
  onGuardar: () => void;
  onCancelar: () => void;
};

export default function ProyectoFormModal({
  visible,
  nombre,
  setNombre,
  editandoId,
  onGuardar,
  onCancelar,
}: ProyectoFormModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-bold mb-4 text-black">
          {editandoId ? 'Editar Proyecto' : 'Crear Proyecto'}
        </h2>

        <input
          type="text"
          placeholder="Nombre del proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border px-2 py-1 w-full mb-4 bg-white text-black placeholder-gray-500"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelar}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={onGuardar}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}