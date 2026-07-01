'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProyectoDetalle() {
  const { id } = useParams();
  const router = useRouter();

  const [proyecto, setProyecto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // Estado para el botón de guardar
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Usamos useCallback para que la función sea estable
  const getProyecto = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch(`${API_URL}/proyectos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('No se pudo cargar el proyecto');

      const data = await res.json();
      setProyecto(data);
      setNombre(data.nombre);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, API_URL, router]);

  const actualizarProyecto = async () => {
    const token = localStorage.getItem('token');
    if (!nombre || nombre === proyecto.nombre) return setEditando(false);

    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/proyectos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) throw new Error();
      
      setProyecto({ ...proyecto, nombre });
      setEditando(false);
      
      // 🚩 NOTIFICACIÓN DE ÉXITO
      toast.success('¡Nombre actualizado correctamente!');

    } catch (err) {
      // 🚩 NOTIFICACIÓN DE ERROR
      toast.error('Hubo un problema al guardar los cambios');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    getProyecto();
  }, [getProyecto]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 animate-pulse font-bold">Cargando detalles...</p>
    </div>
  );

  if (!proyecto) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-bold">Proyecto no encontrado</p>
      <button onClick={() => router.push('/proyectos')} className="mt-4 text-blue-600 underline">
        Volver a la lista
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/proyectos')} 
          className="group mb-6 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> 
          Volver al panel principal
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-blue-600 p-4">
            <h1 className="text-white font-bold uppercase tracking-widest text-sm">Ficha del Proyecto</h1>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 gap-6">
              
              {/* ID Field */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-[10px] text-gray-400 font-black uppercase mb-1 block">Referencia</label>
                <p className="text-gray-700 font-mono">#{proyecto.id}</p>
              </div>

              {/* Nombre Field */}
              <div className="p-4">
                <label className="text-[10px] text-gray-400 font-black uppercase mb-1 block">Nombre del Proyecto / Alumno</label>
                {editando ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="border-2 border-blue-100 p-3 w-full bg-white rounded-xl focus:border-blue-500 outline-none transition-all text-lg text-black"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button 
                        disabled={updating}
                        onClick={actualizarProyecto} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex-1 hover:bg-blue-700 disabled:bg-gray-300"
                      >
                        {updating ? 'Guardando...' : 'Confirmar'}
                      </button>
                      <button 
                        onClick={() => { setEditando(false); setNombre(proyecto.nombre); }} 
                        className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center group">
                    <p className="text-2xl font-bold text-gray-800">{proyecto.nombre}</p>
                    <button 
                      onClick={() => setEditando(true)} 
                      className="text-blue-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    >
                      EDITAR
                    </button>
                  </div>
                )}
              </div>

              {/* Aquí podrías agregar más campos como 'estado' o 'descripcion' */}
              <div className="px-4 py-2 border-t border-gray-50 flex justify-between items-center">
                 <span className="text-xs text-gray-400 italic">Creado el: {new Date(proyecto.createdAt || Date.now()).toLocaleDateString()}</span>
                 <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Activo</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}