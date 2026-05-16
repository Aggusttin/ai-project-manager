type Proyecto = {
  id: number;
  nombre: string;
  activo: boolean;
};

type ProyectosTableProps = {
  proyectos: Proyecto[];
  onEditar: (proyecto: Proyecto) => void;
  onEliminar: (id: number) => void;
};

export default function ProyectosTable({
  proyectos,
  onEditar,
  onEliminar,
}: ProyectosTableProps) {
  return (
    <table className="min-w-full border border-gray-300">
      <thead className="bg-gray-700 text-white">
        <tr>
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">Nombre</th>
          <th className="border px-4 py-2">Estado</th>
          <th className="border px-4 py-2">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {proyectos
          .filter((p) => p.activo)
          .map((p) => (
            <tr key={p.id} className="text-center">
              <td className="border px-4 py-2">{p.id}</td>
              <td className="border px-4 py-2">{p.nombre}</td>
              <td className="border px-4 py-2">
                {p.activo ? 'Activo' : 'Inactivo'}
              </td>

              <td className="border px-4 py-2">
                <button
                  onClick={() => onEditar(p)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => onEliminar(p.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}