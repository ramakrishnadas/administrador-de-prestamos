"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAvales, fetchClientes, fetchIntermediarios, fetchPrestamoById, fetchTiposPrestamo, formatDate, generateAmortizationSchedule, generateReditosSchedule, toTitleCaseWord } from "../lib/helpers"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Aval, Cliente, Intermediario, TipoPrestamo, PrestamoInversionistaWithDetails, Prestamo, Result, Frequency, PaymentScheduleRow } from "../lib/defintions";
import { EntityModal } from "./EntityModal";
import ClienteForm from "./ClienteForm";
import { InversionistaEntryModal } from "./InversionistaEntryModal";
import IntermediarioForm from "./IntermediarioForm";
import AvalForm from "./AvalForm";
import DataTable from "react-data-table-component";

type PrestamoFormProps = {
  onSave?: (prestamo: Prestamo) => void;
  onCancel?: () => void;
  id?: string;
};

export default function PrestamoForm({ 
  onSave,
  id,
}: PrestamoFormProps) {
  const [montoInvertido, setMontoInvertido] = useState(0);
  const [formData, setFormData] = useState({
    id_cliente: "",
    id_tipo_prestamo: "",
    id_intermediario: "",
    id_aval: "",
    monto: String(montoInvertido),
    tasa_interes: "",
    periodicidad: "",
    plazo: 0,
    saldo: String(montoInvertido),
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [tempCliente, setTempCliente] = useState<Cliente | null>(null);
  const [selectedInversionistas, setSelectedInversionistas] = useState<PrestamoInversionistaWithDetails[]>([]);
  const [showInversionistaModal, setShowInversionistaModal] = useState(false);
  const [showIntermediarioModal, setShowIntermediarioModal] = useState(false);
  const [showPaymentScheduleModal, setShowPaymentScheduleModal] = useState(false);
  const [tempIntermediario, setTempIntermediario] = useState<Intermediario | null>(null);
  const [showAvalModal, setShowAvalModal] = useState(false);
  const [tempAval, setTempAval] = useState<Aval | null>(null);
  const [tipoPrestamoNombre, setTipoPrestamoNombre] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("mensual");
  const [result, setResult] = useState<Result | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleRow[]>([]);
  

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({ queryKey: ["cliente"], queryFn: fetchClientes});
  const { data: tipos_prestamo } = useQuery({ queryKey: ["tipo_prestamo"], queryFn: fetchTiposPrestamo});
  const { data: intermediarios } = useQuery({ queryKey: ["intermediario"], queryFn: fetchIntermediarios});
  const { data: avales } = useQuery({ queryKey: ["aval"], queryFn: fetchAvales});
  
  const plazoOptions: Frequency[] = ["semanal", "quincenal", "mensual"];

  const generateSchedule = () => {
    const numericAmount = parseFloat(formData.monto);
    const numericRate = parseFloat(formData.tasa_interes);
    const numericTerm = formData.plazo;
    const fechaInicio = new Date(formData.fecha_inicio);

    if (isNaN(numericAmount) || isNaN(numericRate) || isNaN(numericTerm)) return;

    if (tipoPrestamoNombre === "Financiamiento") {
      
       // ✅ CALCULAR CORRECTAMENTE según frecuencia
      let periodicRate: number;
      let totalPayments: number;

      switch (frequency) {
        case 'mensual':
          // Para mensual: tasa mensual = tasa anual / 12
          periodicRate = (numericRate / 100) / 12;
          totalPayments = numericTerm; // 12 meses = 12 pagos
          break;
        
        case 'quincenal':
          // Para quincenal: tasa quincenal = tasa anual / 24
          periodicRate = (numericRate / 100) / 24;
          totalPayments = numericTerm * 2; // 12 meses = 24 quincenas
          break;
        
        case 'semanal':
          // Para semanal: tasa semanal = tasa anual / 52
          periodicRate = (numericRate / 100) / 52;
          totalPayments = numericTerm * 4; // 12 meses ≈ 48 semanas
          break;
      }
  
      // Compound amortization payment formula
      const paymentPerPeriod =
        numericAmount *
        (periodicRate * Math.pow(1 + periodicRate, numericTerm)) /
        (Math.pow(1 + periodicRate, numericTerm) - 1);
  
      const totalToPay = paymentPerPeriod * numericTerm;
  
      setResult({
        totalToPay: totalToPay.toFixed(2),
        paymentPerPeriod: paymentPerPeriod.toFixed(2),
      });
  
      const schedule = generateAmortizationSchedule(
        numericAmount,
        numericRate,
        totalPayments,
        frequency,
        fechaInicio
      );
      setPaymentSchedule(schedule);
    } else if (tipoPrestamoNombre === "Reditos") {
      // Para Réditos, la tasa periódica se calcula de manera mensual (12 periodos al año)
      // ya que los pagos de interés son typically mensuales incluso si la frecuencia es diferente
      const periodicRate = (numericRate / 100) / 12; // Siempre mensual para cálculo de interés
      
      // Para Réditos, el "plazo" podría ser indefinido, así que proyectamos un número fijo de periodos
      const numberOfPeriodsToProject = numericTerm || 6; // Usar el plazo ingresado o 6 periodos por defecto
      
      // El pago periódico es solo el interés del periodo
      const paymentPerPeriod = numericAmount * periodicRate;
      
      const totalToPay = paymentPerPeriod * numberOfPeriodsToProject; // Esto es solo una proyección

      setResult({
        totalToPay: totalToPay.toFixed(2),
        paymentPerPeriod: paymentPerPeriod.toFixed(2),
      });

      const schedule = generateReditosSchedule(
        numericAmount,
        numericRate,
        numberOfPeriodsToProject,
        frequency,
        fechaInicio // Fecha de inicio (puedes ajustar esto según necesites)
      );
      setPaymentSchedule(schedule);
    } else {
      throw new Error('Tipo de préstamo no válido');
    }
  }

  useEffect(() => {
    const total = selectedInversionistas.reduce((sum, inv) => {
      return sum + parseFloat(inv.monto_invertido);
    }, 0);
    
    setMontoInvertido(total);
  }, [selectedInversionistas]);

  // Update formData when montoInvertido changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      monto: String(montoInvertido),
      saldo: String(montoInvertido), // Keep saldo in sync
    }));
  }, [montoInvertido]);

  useEffect(() => {
    if (id) {
      fetchPrestamoById(id)
        .then((data) => {
          if (!data) {
            setError("Préstamo no encontrado.");
            return;
          }

          const formattedDateInicio = data.fecha_inicio
            ? new Date(data.fecha_inicio).toISOString().split("T")[0]
            : "";

          const formattedDateFin = data.fecha_fin
            ? new Date(data.fecha_fin).toISOString().split("T")[0]
            : "";

          setFormData({
            id_cliente: String(data.id_cliente) ?? "",
            id_tipo_prestamo: String(data.id_tipo_prestamo) ?? "",
            id_intermediario: String(data.id_intermediario) ?? "",
            id_aval: String(data.id_aval) ?? "",
            monto: data.monto ?? "",
            tasa_interes: data.tasa_interes ?? "",
            periodicidad: data.periodicidad ?? "",
            plazo: data.plazo ?? 0,
            saldo: data.saldo ?? "",
            fecha_inicio: formattedDateInicio,
            fecha_fin: formattedDateFin,
          });
        })
        .catch((err) => {
          console.error(err);
          setError("Error al obtener datos del préstamo.")
        });
    }
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // if (name === "monto") {
    //   setFormData((prev) => ({
    //     ...prev,
    //     monto: value,
    //     saldo: value, // sync hidden field
    //   }));
    // } else
    if (name === "id_tipo_prestamo") {
      const selectedTipo = tipos_prestamo?.find((tp: TipoPrestamo) => tp.id.toString() === value);
      const isReditos = selectedTipo?.nombre === "Reditos";
      setTipoPrestamoNombre(selectedTipo?.nombre || "");
  
      setFormData((prev) => ({
        ...prev,
        id_tipo_prestamo: value,
        periodicidad: isReditos ? "mensual" : value,
        plazo: isReditos ? 0 : prev.plazo,
      }));
    } else if (name === "periodicidad") {
      setFormData((prev) => ({ ...prev, periodicidad: value }));
      setFrequency(value.toLowerCase() as Frequency)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const method = id ? "PUT" : "POST";
    
    // 1. Crear el préstamo
    const response = await fetch(
      id ? `/api/prestamo/${id}` : "/api/prestamo",
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Error guardando el préstamo");

    const id_prestamo = result.prestamo?.id || result.id;

    // 2. Ejecutar todas las operaciones en paralelo usando Promise.all
    const operations = [];

    // 2a. Crear registros de prestamo-inversionista
    for (const selectedInversionista of selectedInversionistas) {
      operations.push(
        fetch(`/api/prestamo-inversionista/${id_prestamo}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_inversionista: selectedInversionista.id_inversionista, 
            monto_invertido: selectedInversionista.monto_invertido, 
            ganancia_inversionista: selectedInversionista.ganancia_inversionista, 
            ganancia_administrador: selectedInversionista.ganancia_administrador
          }),
        })
      );
    }

    // 2b. Crear cronograma de pagos (solo si no es edición y hay schedule)
    if (!id && paymentSchedule.length > 0) {
      const cronogramaData = {
        cronogramaPagos: paymentSchedule.map(pago => {
          const saldoCapitalInicial = parseFloat(pago.saldo_capital_inicial);
          const pagoCapital = parseFloat(pago.pago_capital);
          const pagoInteres = parseFloat(pago.pago_interes);
          
          // Calcular el monto_cuota exacto sumando y redondeando
          const montoCuotaExacto = parseFloat((pagoCapital + pagoInteres).toFixed(2));
          
          // Recalcular el saldo final exacto
          const saldoCapitalFinalExacto = parseFloat((saldoCapitalInicial - pagoCapital).toFixed(2));

          return {
            numero_cuota: pago.numero_cuota,
            fecha_limite: pago.fecha_limite,
            saldo_capital_inicial: saldoCapitalInicial,
            pago_capital: pagoCapital,
            pago_interes: pagoInteres,
            monto_cuota: montoCuotaExacto, // Usar la suma exacta
            saldo_capital_final: saldoCapitalFinalExacto, // Usar el cálculo exacto
            estado: "pendiente"
          };
        })
      };

      operations.push(
        fetch(`/api/cronograma-pagos/${id_prestamo}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cronogramaData),
        })
      );
    }

    // 3. Ejecutar todas las operaciones en paralelo
    const responses = await Promise.all(operations);
    
    // 4. Verificar que todas las respuestas sean exitosas
    for (const response of responses) {
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Error en operación secundaria");
      }
    }

    setSuccess(id ? "Préstamo modificado exitosamente" : "Préstamo creado exitosamente");

    if (onSave) {
      onSave(result as Prestamo);
    } else {
      setTimeout(() => {
        router.push("/prestamo");
      }, 1500);
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message || "Ocurrió un error");
    } else {
      setError("Ocurrió un error desconocido");
    }
  } finally {
    setLoading(false);
  }
};

  const handleClienteSave = (cliente: Cliente) => {
    // Invalidate the query to refetch the updated list of clientes
    queryClient.invalidateQueries({ queryKey: ["cliente"] });
  
    // Select the new cliente in the form
    setFormData((prev) => ({
      ...prev,
      id_cliente: cliente.id.toString(),
    }));
  
    // Close the modal and reset tempCliente
    setTempCliente(null);
    setShowClienteModal(false);
  };

  const removeInversionista = (index: number) => {
    setSelectedInversionistas((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleIntermediarioSave = (intermediario: Intermediario) => {
    // Invalidate the query to refetch the updated list of intermediarios
    queryClient.invalidateQueries({ queryKey: ["intermediario"] });
  
    // Select the new intermediarios in the form
    setFormData((prev) => ({
      ...prev,
      id_intermediario: intermediario.id.toString(),
    }));
  
    // Close the modal and reset tempIntermediarios
    setTempIntermediario(null);
    setShowIntermediarioModal(false);
  };

  const handleAvalSave = (aval: Aval) => {
    // Invalidate the query to refetch the updated list of avales
    queryClient.invalidateQueries({ queryKey: ["aval"] });
  
    // Select the new aval in the form
    setFormData((prev) => ({
      ...prev,
      id_aval: aval.id.toString(),
    }));
  
    // Close the modal and reset tempAval
    setTempAval(null);
    setShowAvalModal(false);
  };

  const columns = [
     { name: "Pago No.", selector: (row: PaymentScheduleRow) => row.numero_cuota, sortable: true },
     { name: 'Saldo Capital', selector: (row: PaymentScheduleRow) => row.saldo_capital_inicial, // Keep this as a number for sorting
           sortable: true,
           format: (row: PaymentScheduleRow) => 
             new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.saldo_capital_inicial)),
           sortFunction: (a: PaymentScheduleRow, b: PaymentScheduleRow) => parseFloat(a.saldo_capital_inicial) - parseFloat(b.saldo_capital_inicial) // Ensure numeric sorting
     },
     { name: 'Pago Capital', selector: (row: PaymentScheduleRow) => row.pago_capital, // Keep this as a number for sorting
           sortable: true,
           format: (row: PaymentScheduleRow) => 
             new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.pago_capital)),
           sortFunction: (a: PaymentScheduleRow, b: PaymentScheduleRow) => parseFloat(a.pago_capital) - parseFloat(b.pago_capital)
     },
     { name: 'Pago Intereses', selector: (row: PaymentScheduleRow) => row.pago_interes,
           sortable: true,
           format: (row: PaymentScheduleRow) => 
             new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.pago_interes)),
           sortFunction: (a: PaymentScheduleRow, b: PaymentScheduleRow) => parseFloat(a.pago_interes) - parseFloat(b.pago_interes)
     },
     { name: 'Monto de Pago', selector: (row: PaymentScheduleRow) => row.monto_cuota,
           sortable: true,
           format: (row: PaymentScheduleRow) => 
             new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.monto_cuota)),
           sortFunction: (a: PaymentScheduleRow, b: PaymentScheduleRow) => parseFloat(a.monto_cuota) - parseFloat(b.monto_cuota)
     },
     { name: 'Saldo Capital Restante', selector: (row: PaymentScheduleRow) => row.saldo_capital_final,
           sortable: true,
           format: (row: PaymentScheduleRow) => 
             new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.saldo_capital_final)),
           sortFunction: (a: PaymentScheduleRow, b: PaymentScheduleRow) => parseFloat(a.saldo_capital_final) - parseFloat(b.saldo_capital_final) 
     },
     { name: "Fecha", selector: (row: PaymentScheduleRow) => {
         const fecha = new Date(row.fecha_limite);
         const formattedDate = formatDate(fecha);
         return formattedDate;
       } 
     }
   ]
  
  return (
    <div className="bg-white shadow-md rounded px-8 py-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-black">{id ? "Editar Préstamo" : "Registrar Préstamo"}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Cliente</label>
          <select
            name="id_cliente"
            value={formData.id_cliente || ""}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          >
            <option value="">Selecciona un cliente</option>
            {clientes?.map((c: Cliente) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.nombre_completo}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowClienteModal(true)}
            className="mt-2 text-blue-600 hover:underline text-sm cursor-pointer"
          >
            Crear cliente nuevo
          </button>
        </div>     

        <div className="mb-4">
          <h3 className="mt-4">Inversionistas</h3>
          <ul className="mb-2">
            {selectedInversionistas?.map((inv: PrestamoInversionistaWithDetails, i: number) => (
              <li key={i}>
                {inv.id_inversionista} — {inv.inversionista?.nombre_completo} — {inv.monto_invertido}
                <button className="ml-2 cursor-pointer" onClick={() => removeInversionista(i)}>🗑️</button>
              </li>
            ))}
          </ul>
          <button className="cursor-pointer" type="button" onClick={() => setShowInversionistaModal(true)}>
            ➕ Agregar inversionista
          </button>
        </div>

        <div className="mb-4">
          <input
            type="hidden"
            name="inversionistas"
            value={JSON.stringify(selectedInversionistas)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Intermediario</label>
          <select
            name="id_intermediario"
            value={formData.id_intermediario || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black"
          >
            <option value="">Ninguno</option>
            {intermediarios?.map((i: Intermediario) => (
              <option key={i.id} value={i.id}>
                {i.id} - {i.nombre_completo}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowIntermediarioModal(true)}
            className="mt-2 text-blue-600 hover:underline text-sm cursor-pointer"
          >
            Crear intermediario nuevo
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Aval</label>
          <select
            name="id_aval"
            value={formData.id_aval || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black"
          >
            <option value="">Ninguno</option>
            {avales?.map((a: Aval) => (
              <option key={a.id} value={a.id}>
                {a.id} - {a.nombre_completo}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAvalModal(true)}
            className="mt-2 text-blue-600 hover:underline text-sm cursor-pointer"
          >
            Crear aval nuevo
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Tipo de Préstamo</label>
          <select
            name="id_tipo_prestamo"
            value={formData.id_tipo_prestamo || ""}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          >
            <option value="">Selecciona un tipo de préstamo</option>
            {tipos_prestamo?.map((tp: TipoPrestamo) => (
              <option key={tp.id} value={tp.id} title={tp.descripcion}>
                {tp.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Monto</label>
          <input
            type="number"
            step="0.01"
            name="monto"
            value={formData.monto}
            readOnly
            // onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">{tipoPrestamoNombre === "Reditos" ? "Tasa de Interés Mensual (%)" : "Tasa de Interés Anual (%)"}</label>
          <input
            type="number"
            name="tasa_interes"
            step="0.01"
            value={formData.tasa_interes}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Periodicidad</label>
          <select
            name="periodicidad"
            value={formData.periodicidad}
            onChange={handleChange}
            required
            className={tipoPrestamoNombre === "Reditos" ? "w-full border px-3 py-2 rounded text-black cursor-not-allowed" : "w-full border px-3 py-2 rounded text-black"}
            disabled={tipoPrestamoNombre === "Reditos"}
          >
            <option value="">Selecciona la periodicidad</option>
            {plazoOptions?.map((p) => (
              <option key={p} value={p}>
                {toTitleCaseWord(p)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Plazo</label>
          <input
            type="number"
            name="plazo"
            step="1"
            value={formData.plazo}
            onChange={handleChange}
            disabled={tipoPrestamoNombre === "Reditos"}
            className={tipoPrestamoNombre === "Reditos" ? "w-full border px-3 py-2 rounded text-black cursor-not-allowed" : "w-full border px-3 py-2 rounded text-black"}
          />
        </div>

        <div className="mb-4">
          <input
            type="hidden"
            step="0.01"
            name="saldo"
            value={formData.monto}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Fecha de Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <button 
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-2 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
          type="button"
          disabled={!formData.id_tipo_prestamo || !formData.monto || !formData.tasa_interes || !formData.periodicidad || (formData.plazo === undefined || formData.plazo === null || isNaN(formData.plazo)) || !formData.fecha_inicio}
          onClick={() => {
            generateSchedule();
            setShowPaymentScheduleModal(true);
            }
          }>
            Ver cronograma de pagos
        </button>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Guardando..." : id ? "Guardar Cambios" : "Registrar"}
        </button>
      </form>

      <EntityModal
        visible={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSave={handleClienteSave}
        initialData={tempCliente ?? undefined}
        FormComponent={ClienteForm}
      />
      {showInversionistaModal && (
        <InversionistaEntryModal  
          onSave={(entry) => {
            setSelectedInversionistas([...selectedInversionistas, entry]);
            setShowInversionistaModal(false);
          }}
          onCancel={() => setShowInversionistaModal(false)}
        />
      )}
      <EntityModal
        visible={showIntermediarioModal}
        onClose={() => setShowIntermediarioModal(false)}
        onSave={handleIntermediarioSave}
        initialData={tempIntermediario ?? undefined}
        FormComponent={IntermediarioForm}
      />
      <EntityModal
        visible={showAvalModal}
        onClose={() => setShowAvalModal(false)}
        onSave={handleAvalSave}
        initialData={tempAval ?? undefined}
        FormComponent={AvalForm}
      />
      {showPaymentScheduleModal && (
        <>
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-6xl w-full relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPaymentScheduleModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ×
              </button>
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-4">
                  <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
                  <p><strong>Total a pagar:</strong> ${result?.totalToPay}</p>
                  <p><strong>Pago {frequency}:</strong> ${result?.paymentPerPeriod}</p>
              </div>
              <div className="mx-20 mt-8">
                <h3 className="text-lg font-semibold mb-2">Cronograma de Pagos</h3>
                <DataTable
                  columns={columns}
                  data={paymentSchedule}
                  pagination
                  paginationPerPage={15}
                  dense
                  striped
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
