'use client';
import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (nombre: string, descripcion: string) => void;
  proyectoInicial?: { nombre: string; descripcion: string } | null;
  modoEdicion: boolean;
}

export const ProyectoFormModal = ({ isOpen, onClose, onGuardar, proyectoInicial, modoEdicion }: Props) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Sincronizar si entramos en modo edición
  useEffect(() => {
    if (proyectoInicial) {
      setNombre(proyectoInicial.nombre);
      setDescripcion(proyectoInicial.descripcion || "");
    } else {
      setNombre("");
      setDescripcion("");
    }
  }, [proyectoInicial, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{modoEdicion ? "Editar Proyecto" : "Nuevo Proyecto"}</h2>
        <input 
          className="w-full mb-4 p-3 border rounded-lg" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Nombre del proyecto" 
        />
        <textarea 
          className="w-full mb-4 p-3 border rounded-lg" 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          placeholder="Descripción" 
        />
        <div className="flex gap-3">
          <button 
            onClick={() => onGuardar(nombre, descripcion)} 
            className="bg-green-600 text-white px-5 py-2 rounded-lg"
          >
            Guardar
          </button>
          <button onClick={onClose} className="bg-gray-300 px-5 py-2 rounded-lg">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};