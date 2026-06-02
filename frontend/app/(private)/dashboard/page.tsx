"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchResumen();
  }, []);

  const fetchResumen = async () => {
    try {
      const res = await api.get("/proyectos/1/resumen");
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card titulo="Historias" valor={data.cantidad_historias} />
        <Card titulo="Puntos" valor={data.total_puntos} />
        <Card titulo="Usuarios" valor={data.usuarios} />
        <Card titulo="Clientes" valor={data.clientes} />
      </div>
    </div>
  );
}

function Card({ titulo, valor }: any) {
  return (
    <div className="bg-white text-black p-4 rounded shadow">
      <h3 className="text-sm">{titulo}</h3>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}