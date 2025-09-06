"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { fetchPrestamoById, fetchClienteById, fetchAvalById, fetchPrestamoInversionistasByPrestamoId, fetchInversionistaById, fetchCronogramaById, formatDate, toTitleCaseWord, fetchTiposPrestamo } from "@/app/lib/helpers";
import { useQueries, useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import { CronogramaPagos, TipoPrestamo } from "@/app/lib/defintions";
import PaymentModal from "@/app/components/PaymentModal";

export default function PrestamoViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<[boolean, CronogramaPagos | null]>([false, null]);
  const [success, setSuccess] = useState<string | null>(null); // Success state
  
  const { data: prestamo, isLoading: isLoadingPrestamo } = useQuery({ queryKey: [ "prestamo", id ], queryFn: () => fetchPrestamoById(String(id)), enabled: !!id });
  const { data: tiposPrestamo, isLoading: isLoadingTipoPrestamo } = useQuery({ queryKey: [ "tipo_prestamo" ], queryFn: fetchTiposPrestamo });
  const { data: cliente, isLoading: isLoadingCliente } = useQuery({ queryKey: [ "cliente", id ], queryFn: () => fetchClienteById(String(prestamo?.id_cliente)), enabled: !!prestamo?.id_cliente });
  const { data: aval, isLoading: isLoadingAval } = useQuery({ queryKey: [ "aval", id ], queryFn: () => fetchAvalById(String(prestamo?.id_aval)), enabled: !!prestamo?.id_aval });
  const { data: prestamoInversionistas, isLoading: isLoadingPrestamoInversionistas } = useQuery({ queryKey: [ "prestamo-inversionista", id ], queryFn: () => fetchPrestamoInversionistasByPrestamoId(String(id))});
  const { data: cronogramaPagos, isLoading: isLoadingCronograma } = useQuery({ queryKey: [ "cronograma-pagos", id ], queryFn: () => fetchCronogramaById(String(id)), enabled: !!id });

  const inversionistaIds = prestamoInversionistas?.map( pi => pi.id_inversionista ) || [];

  const tipoPrestamo = tiposPrestamo?.find( (tipo: TipoPrestamo) => tipo.id === prestamo?.id_tipo_prestamo)?.nombre;

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

  if (isLoadingPrestamo || isLoadingCliente || isLoadingAval || isLoadingPrestamoInversionistas || isLoadingInversionistas || isLoadingTipoPrestamo || isLoadingCronograma) 
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

  const columns = [
    { name: "Pago No.", selector: (row: CronogramaPagos) => row.numero_cuota, sortable: true },
    { name: 'Saldo Capital', selector: (row: CronogramaPagos) => row.saldo_capital_inicial, // Keep this as a number for sorting
          sortable: true,
          format: (row: CronogramaPagos) => 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.saldo_capital_inicial)),
          sortFunction: (a: CronogramaPagos, b: CronogramaPagos) => parseFloat(a.saldo_capital_inicial) - parseFloat(b.saldo_capital_inicial) // Ensure numeric sorting
    },
    { name: 'Pago Capital', selector: (row: CronogramaPagos) => row.pago_capital, // Keep this as a number for sorting
          sortable: true,
          format: (row: CronogramaPagos) => 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.pago_capital)),
          sortFunction: (a: CronogramaPagos, b: CronogramaPagos) => parseFloat(a.pago_capital) - parseFloat(b.pago_capital)
    },
    { name: 'Pago Intereses', selector: (row: CronogramaPagos) => row.pago_interes,
          sortable: true,
          format: (row: CronogramaPagos) => 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.pago_interes)),
          sortFunction: (a: CronogramaPagos, b: CronogramaPagos) => parseFloat(a.pago_interes) - parseFloat(b.pago_interes)
    },
    { name: 'Monto de Pago', selector: (row: CronogramaPagos) => row.monto_cuota,
          sortable: true,
          format: (row: CronogramaPagos) => 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.monto_cuota)),
          sortFunction: (a: CronogramaPagos, b: CronogramaPagos) => parseFloat(a.monto_cuota) - parseFloat(b.monto_cuota)
    },
    { name: 'Saldo Capital Restante', selector: (row: CronogramaPagos) => row.saldo_capital_final,
          sortable: true,
          format: (row: CronogramaPagos) => 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.saldo_capital_final)),
          sortFunction: (a: CronogramaPagos, b: CronogramaPagos) => parseFloat(a.saldo_capital_final) - parseFloat(b.saldo_capital_final) 
    },
    { name: "Fecha", selector: (row: CronogramaPagos) => {
        const fecha = new Date(row.fecha_limite);
        const formattedDate = formatDate(fecha);
        return formattedDate;
      } 
    },
    { name: "Estado", selector: (row: CronogramaPagos) => toTitleCaseWord(row.estado) },
    {
        name: "",
        cell: (row: CronogramaPagos) => {
          if (row.estado === "pagado" || row.estado === "cancelado") {
            return null; // No mostrar nada
          }
          return (
            <button
              onClick={() => setShowPaymentModal([true, row])}
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm cursor-pointer"
          >
            Registrar Pago
          </button>
          )
          
        },
        
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-8xl mx-auto">
          
          {/* Header Section - Ocupa todo el ancho */}
          <div className="lg:col-span-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Préstamo ID: {prestamo.id}
                </h1>
              </div>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-700 focus:outline-none cursor-pointer whitespace-nowrap"
                onClick={() => setShowModal(true)}
              >
                Eliminar Préstamo
              </button>
            </div>
          </div>

          {/* Loan Info Section - Ocupa 1/4 del ancho en desktop, full en mobile */}
          <div className="lg:col-span-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="space-y-6 flex justify-around">
              {/* Cliente Section */}
              {cliente && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800">Cliente</h2>
                  <p className="text-gray-700">{cliente.nombre_completo}</p>
                </div>
              )}

              {/* Inversionistas Section */}
              {inversionistas && inversionistas.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800">Inversionistas</h2>
                  <p className="text-gray-700">{nombresInversionistas}</p>
                </div>
              )}

              {/* Aval Section */}
              {aval && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800">Aval</h2>
                  <p className="text-gray-700">{aval.nombre_completo}</p>
                </div>
              )}

              {/* Aquí puedes agregar más información del préstamo */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">Tipo de Préstamo</h2>
                <p className="text-gray-700">{tipoPrestamo ?? ""}</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">Monto</h2>
                <p className="text-gray-700">${prestamo.monto}</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">Saldo</h2>
                <p className="text-gray-700">${prestamo.saldo}</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">Tasa de interés</h2>
                <p className="text-gray-700">{Math.round(parseFloat(prestamo.tasa_interes) * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Payment Schedule Section - Ocupa 3/4 del ancho en desktop, full en mobile */}
          {cronogramaPagos && (
            <>
            <div className="lg:col-span-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cronograma de Pagos</h2>
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={cronogramaPagos}
                  pagination
                  paginationPerPage={15}
                  dense
                  striped
                  responsive
                />
              </div>
            </div>
            </>
          )}
          
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
    
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal[0]}
        onClose={() => setShowPaymentModal([false, null])}
        rowData={showPaymentModal[1]}
        loanType={tipoPrestamo}
        onSave={(pago) => {
          // Aquí puedes actualizar el estado o refrescar los datos
          console.log('Pago registrado:', pago);
        }}
      />
    </>
    
  );
}

