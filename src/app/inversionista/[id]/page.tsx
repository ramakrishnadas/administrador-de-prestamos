"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Inversionista } from "@/app/lib/defintions";
import { fetchInversionistaById } from "@/app/lib/helpers";

export default function InversionistaViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [inversionista, setInversionista] = useState<Inversionista | null | "not_found">(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState<string | null>(null); // Success state

  useEffect(() => {
    if (typeof id === "string") {
      fetchInversionistaById(id)
        .then((data) => setInversionista(data ?? "not_found"))
        .catch(() => setInversionista("not_found"));
    }
  }, [id]);

  async function deleteInversionista() {
    try {
      const res = await fetch(`/api/inversionista/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar inversionista");

      setSuccess("Inversionista eliminado exitosamente."); // Set success message
      setTimeout(() => router.push("/inversionista"), 1500); // Delay redirect to show message
    } catch (error) {
      console.error(error);
    }
  }

  if (inversionista === "not_found") {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold text-red-600">404 - Inversionista no encontrado</h1>
        <p className="text-gray-700 mt-2">El inversionista que estás buscando no existe o fue eliminado.</p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => router.push("/inversionista")}
        >
          Volver a la lista de inversionistas
        </button>
      </div>
    );
  }

  if (!inversionista) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  const formattedDate = new Date(inversionista.fecha_registro).toISOString().split('T')[0];;

  return (
    <div className="container mx-auto mt-6 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {inversionista.nombre_completo}
        </h1>
        <div className="space-y-2 text-gray-700">
          <p><span className="font-semibold">Email:</span> {inversionista.email}</p>
          <p><span className="font-semibold">Fecha de Registro:</span> {formattedDate}</p>
          <p><span className="font-semibold">Saldo:</span> {inversionista.saldo}</p>
        </div>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-700 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Eliminar
        </button>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            {success ? (
                <p className="text-green-600 text-center font-medium">{success}</p>
              ) : (
                <>
                  <p className="mb-4 text-lg font-medium text-gray-800 text-center">
                    ¿Estás seguro de que deseas eliminar este inversionista?
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                      onClick={deleteInversionista}
                    >
                      Sí, eliminar
                    </button>
                    <button
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
