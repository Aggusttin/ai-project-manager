interface Props {
  proyecto: any;
  estaActivo: boolean;
  userRol: string;
  onEditar: () => void;
  onDesactivar: () => void;
  onReactivar: () => void;
}

export const ProyectoActions = ({ 
  estaActivo, userRol, onEditar, onDesactivar, onReactivar 
}: Props) => {
  return (
    <div className="text-sm font-medium space-x-3">
      {userRol !== 'desarrollador' && (
        <button onClick={onEditar} className="text-blue-600 hover:text-blue-900">Editar</button>
      )}

      {estaActivo && userRol !== 'desarrollador' && (
        <button onClick={onDesactivar} className="text-red-600 hover:text-red-900">Desactivar</button>
      )}

      {!estaActivo && (
        <button onClick={onReactivar} className="text-indigo-600 hover:text-indigo-900 font-bold">Reactivar</button>
      )}
    </div>
  );
};