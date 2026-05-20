import { useState, useEffect } from 'react';
import { proyectosService, Proyecto } from '../services/proyectos.service';

export const useProyectos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const data = mostrarInactivos 
        ? await proyectosService.getInactiveProjects() 
        : await proyectosService.getProjects();
      setProyectos([...data]);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarProyectos(); }, [mostrarInactivos]);

  const guardar = async (id: number | null, data: { nombre: string; descripcion: string }) => {
    if (id) await proyectosService.updateProject(id, data);
    else await proyectosService.createProject(data);
    await cargarProyectos();
  };

  const desactivar = async (id: number) => {
    await proyectosService.deactivateProject(id);
    await cargarProyectos();
  };

  const reactivar = async (id: number) => {
    await proyectosService.restoreProject(id);
    setMostrarInactivos(false); // Volver a activos tras restaurar
  };

  return { proyectos, loading, mostrarInactivos, setMostrarInactivos, cargarProyectos, guardar, desactivar, reactivar };
};