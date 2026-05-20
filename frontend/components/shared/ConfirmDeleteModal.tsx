type ConfirmDeleteModalProps = {
  visible: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ConfirmDeleteModal({
  visible,
  onConfirmar,
  onCancelar,
}: ConfirmDeleteModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-lg font-bold mb-4 text-black">
          Confirmar eliminación
        </h2>

        <p className="mb-4 text-black">
          ¿Desea eliminar el proyecto?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelar}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirmar}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}