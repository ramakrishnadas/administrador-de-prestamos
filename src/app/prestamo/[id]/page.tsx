"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { fetchPrestamoById, fetchClienteById, fetchAvalById, fetchPrestamoInversionistasByPrestamoId, fetchInversionistaById } from "@/app/lib/helpers";
import { useQueries, useQuery } from "@tanstack/react-query";

export default function PrestamoViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState<string | null>(null); // Success state
  
  const { data: prestamo, isLoading: isLoadingPrestamo } = useQuery({ queryKey: [ "prestamo", id ], queryFn: () => fetchPrestamoById(String(id)), enabled: !!id });
  const { data: cliente, isLoading: isLoadingCliente } = useQuery({ queryKey: [ "cliente", id ], queryFn: () => fetchClienteById(String(prestamo?.id_cliente)), enabled: !!prestamo?.id_cliente });
  const { data: aval, isLoading: isLoadingAval } = useQuery({ queryKey: [ "aval", id ], queryFn: () => fetchAvalById(String(prestamo?.id_aval)), enabled: !!prestamo?.id_aval });
  const { data: prestamoInversionistas, isLoading: isLoadingPrestamoInversionistas } = useQuery({ queryKey: [ "prestamo-inversionista", id ], queryFn: () => fetchPrestamoInversionistasByPrestamoId(String(id))});

  const inversionistaIds = prestamoInversionistas?.map( pi => pi.id_inversionista ) || [];

  const inversionistaQueries = useQueries({
    queries: inversionistaIds.map( id => ({
      queryKey: [ "inversionista", id ],
      queryFn: () => fetchInversionistaById(String(id)),
      enabled: !!id
    }))
  })

  const isLoadingInversionistas = inversionistaQueries.some(q => q.isLoading);
  // const hasErrorInversionistas = inversionistaQueries.some(q => q.isError);
  const inversionistas = inversionistaQueries.map(q => q.data);

  const nombresInversionistas = inversionistas.map( inversionista => inversionista?.nombre_completo).join(", ");

  async function deletePrestamo() {
    try {
      const res = await fetch(`/api/prestamo/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar préstamo");

      setSuccess("Préstamo eliminado exitosamente.");
      setTimeout(() => router.push("/prestamo"), 1500);
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoadingPrestamo || isLoadingCliente || isLoadingAval || isLoadingPrestamoInversionistas || isLoadingInversionistas) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  if (!prestamo) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold text-red-600">404 - Préstamo no encontrado</h1>
        <p className="text-gray-700 mt-2">El préstamo que estás buscando no existe o fue eliminado.</p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => router.push("/prestamo")}
        >
          Volver a la lista de préstamos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-6 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Préstamo ID: {prestamo.id}
        </h1>
          
        {/* Cliente Section */}
        {cliente && (
          <div className="space-y-4 text-gray-700">
            <h2 className="text-xl font-semibold text-gray-800">Cliente: {cliente.nombre_completo}</h2>
          </div>
        )}

        {/* Inversionistas Section */}
        {inversionistas && inversionistas.length > 0 && (
          <div className="space-y-4 text-gray-700">
            <h2 className="text-xl font-semibold text-gray-800">Inversionistas: {nombresInversionistas}</h2>
          </div>
        )}

        {/* Aval Section */}
        {aval && (
          <div className="space-y-4 text-gray-700">
            <h2 className="text-xl font-semibold text-gray-800">Aval: {aval.nombre_completo}</h2>
          </div>
        )}

      <div className="mt-6">
          <button
            className="bg-red-500 text-white px-6 py-3 rounded w-full hover:bg-red-700 focus:outline-none cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            Eliminar Préstamo
          </button>
        </div>
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
                    ¿Estás seguro de que deseas eliminar este préstamo?
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                      onClick={deletePrestamo}
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
