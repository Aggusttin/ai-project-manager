interface Props {
  activo?: boolean;
  onDeactivate: () => void;
  onRestore: () => void;
}

export default function ClienteActions({
  activo,
  onDeactivate,
  onRestore,
}: Props) {
  return (
    <div className="flex gap-2">
      {activo ? (
        <button
          onClick={onDeactivate}
          className="bg-red-500 text-white px-3 py-1 rounded-lg"
        >
          Desactivar
        </button>
      ) : (
        <button
          onClick={onRestore}
          className="bg-green-600 text-white px-3 py-1 rounded-lg"
        >
          Reactivar
        </button>
      )}
    </div>
  );
}