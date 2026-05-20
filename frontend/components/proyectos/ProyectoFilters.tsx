interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  mostrarInactivos: boolean;
  onToggleInactivos: () => void;
}

export const ProyectoFilters = ({ searchQuery, onSearchChange, mostrarInactivos, onToggleInactivos }: Props) => {
  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border p-2 rounded-lg w-full max-w-sm"
      />
      <button 
        onClick={onToggleInactivos} 
        className={`px-4 py-2 rounded-lg ${mostrarInactivos ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
      >
        {mostrarInactivos ? "Ver Activos" : "Ver Inactivos"}
      </button>
    </div>
  );
};