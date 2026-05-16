"use client";

import { useState } from "react";

export default function RecursosPage() {
  const [archivo, setArchivo] = useState<File | null>(
    null
  );

  const handleUpload = async () => {
    if (!archivo) return;

    const formData = new FormData();

    formData.append("file", archivo);

    console.log("UPLOAD READY");
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 text-black">
      <h1 className="text-3xl font-black mb-6">
        Recursos
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <input
          type="file"
          onChange={(e) =>
            setArchivo(e.target.files?.[0] || null)
          }
        />

        <button
          onClick={handleUpload}
          className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Subir recurso
        </button>
      </div>
    </div>
  );
}