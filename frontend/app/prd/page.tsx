"use client";

import { useState } from "react";

export default function PrdPage() {
  const [contenido, setContenido] = useState("");

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <h1 className="text-3xl font-black mb-6">
        Documento PRD
      </h1>

      <textarea
        value={contenido}
        onChange={(e) =>
          setContenido(e.target.value)
        }
        className="w-full h-[600px] border rounded-xl p-5"
        placeholder="Escribí el PRD..."
      />
    </div>
  );
}