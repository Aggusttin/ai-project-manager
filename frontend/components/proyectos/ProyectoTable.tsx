"use client";
import React from 'react';
import { ProyectoStatusBadge } from './ProyectoStatusBadge';
import { ProyectoActions } from './ProyectoActions';
import type { Proyecto } from '@/services/proyectos.service';

interface ProyectoTableProps {
  proyectos: Proyecto[];
  onDesactivar: (id: number) => void;
  onReactivar: (id: number) => void;
  onEditar: (proyecto: Proyecto) => void;
  userRol: string;
}

export const ProyectoTable: React.FC<ProyectoTableProps> = ({ 
  proyectos, onDesactivar, onReactivar, onEditar, userRol 
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {proyectos.map((proyecto) => (
            <tr key={proyecto.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{proyecto.nombre}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{proyecto.descripcion || 'Sin descripción'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ProyectoStatusBadge activo={proyecto.activo} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ProyectoActions 
                  estaActivo={proyecto.activo}
                  userRol={userRol}
                  onEditar={() => onEditar(proyecto)}
                  onDesactivar={() => onDesactivar(proyecto.id)}
                  onReactivar={() => onReactivar(proyecto.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};