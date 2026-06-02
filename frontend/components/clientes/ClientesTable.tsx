import ClienteActions from "./ClienteActions";

import { Cliente } from "@/services/clientes.service";

interface Props {
  clientes: Cliente[];

  onDeactivate: (id: number) => void;

  onRestore: (id: number) => void;
}

export default function ClientesTable({
  clientes,
  onDeactivate,
  onRestore,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-4 text-left">
              Razón Social
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Teléfono
            </th>

            <th className="p-4 text-left">
              Estado
            </th>

            <th className="p-4 text-left">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente.id}
              className="border-b"
            >
              <td className="p-4 font-bold">
                {cliente.razon_social}
              </td>

              <td className="p-4">
                {cliente.email}
              </td>

              <td className="p-4">
                {cliente.telefono}
              </td>

              <td className="p-4">
                {cliente.activo ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm">
                    Activo
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm">
                    Inactivo
                  </span>
                )}
              </td>

              <td className="p-4">
                <ClienteActions
                  activo={cliente.activo}
                  onDeactivate={() =>
                    onDeactivate(cliente.id)
                  }
                  onRestore={() =>
                    onRestore(cliente.id)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}