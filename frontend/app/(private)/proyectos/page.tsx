'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProyectos } from '@/hooks/useProyectos';
import { ProyectoTable } from '@/components/proyectos/ProyectoTable';
import { ProyectoFormModal } from '@/components/proyectos/ProyectoFormModal';
import { ProyectoFilters } from '@/components/proyectos/ProyectoFilters';

export default function ProyectosPage() {
  const { proyectos, loading, mostrarInactivos, setMostrarInactivos, guardar, desactivar, reactivar } = useProyectos();
  
  const auth = useAuth();
  const user = auth?.user || null; 
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; nombre: string; descripcion: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lógica de filtrado en el cliente
  const proyectosFiltrados = proyectos.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && proyectos.length === 0) return <div>Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">{mostrarInactivos ? "Proyectos Inactivos" : "Proyectos"}</h1>
        <button 
          onClick={() => { setEditing(null); setModalOpen(true); }} 
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Nuevo Proyecto
        </button>
      </div>

      <ProyectoFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        mostrarInactivos={mostrarInactivos}
        onToggleInactivos={() => setMostrarInactivos(!mostrarInactivos)}
      />

      <ProyectoTable 
        proyectos={proyectosFiltrados} 
        onDesactivar={desactivar} 
        onReactivar={reactivar}
        onEditar={(p) => { setEditing({ id: p.id, nombre: p.nombre, descripcion: p.descripcion || "" }); setModalOpen(true); }}
        userRol={user?.rol || "administrador"} 
      />

      <ProyectoFormModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        proyectoInicial={editing}
        onGuardar={async (n, d) => { 
          await guardar(editing?.id || null, { nombre: n, descripcion: d }); 
          setModalOpen(false); 
        }}
      />
    </div>
  );
}