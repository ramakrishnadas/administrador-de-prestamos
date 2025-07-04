"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAvales, fetchClientes, fetchIntermediarios, fetchPrestamoById, fetchTiposPrestamo } from "../lib/helpers"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Aval, Cliente, Intermediario, TipoPrestamo, PlazoPrestamo, PrestamoInversionistaWithDetails, Prestamo } from "../lib/defintions";
import { EntityModal } from "./EntityModal";
import ClienteForm from "./ClienteForm";
import { InversionistaEntryModal } from "./InversionistaEntryModal";
import IntermediarioForm from "./IntermediarioForm";
import AvalForm from "./AvalForm";

type PrestamoFormProps = {
  onSave?: (prestamo: Prestamo) => void;
  onCancel?: () => void;
  id?: string;
};

export default function PrestamoForm({ 
  onSave,
  onCancel,
  id,
}: PrestamoFormProps) {
  const [formData, setFormData] = useState({
    id_cliente: "",
    id_tipo_prestamo: "",
    id_intermediario: "",
    id_aval: "",
    monto: "",
    tasa_interes: "",
    periodicidad: "",
    plazo: 0,
    saldo: "",
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
  const [tempIntermediario, setTempIntermediario] = useState<Intermediario | null>(null);
  const [showAvalModal, setShowAvalModal] = useState(false);
  const [tempAval, setTempAval] = useState<Aval | null>(null);
  const [tipoPrestamoNombre, setTipoPrestamoNombre] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({ queryKey: ["cliente"], queryFn: fetchClientes});

  const { data: tipos_prestamo } = useQuery({ queryKey: ["tipo_prestamo"], queryFn: fetchTiposPrestamo});

  const { data: intermediarios } = useQuery({ queryKey: ["intermediario"], queryFn: fetchIntermediarios});

  const { data: avales } = useQuery({ queryKey: ["aval"], queryFn: fetchAvales});

  const plazoOptions: PlazoPrestamo[] = ["Indefinido", "Semanal", "Quincenal", "Mensual"];

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

    if (name === "monto") {
      setFormData((prev) => ({
        ...prev,
        monto: value,
        saldo: value, // sync hidden field
      }));
    } else if (name === "id_tipo_prestamo") {
      const selectedTipo = tipos_prestamo?.find((tp: TipoPrestamo) => tp.id.toString() === value);
      const isReditos = selectedTipo?.nombre === "Reditos";
      setTipoPrestamoNombre(selectedTipo?.nombre || "");
  
      setFormData((prev) => ({
        ...prev,
        id_tipo_prestamo: value,
        periodicidad: isReditos ? "Indefinido" : "",
        plazo: isReditos ? 0 : prev.plazo,
      }));
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
      const response = await fetch(
        id ? `/api/prestamo/${id}` : "/api/prestamo",
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || "Error guardando al prestamo");

      const id_prestamo = await result.prestamo.id;
      for (const selectedInversionista of selectedInversionistas) {
        const response2 = await fetch(`/api/prestamo-inversionista/${id_prestamo}`,
          {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_inversionista: selectedInversionista.id_inversionista, 
              monto_invertido: selectedInversionista.monto_invertido, 
              ganancia_inversionista: selectedInversionista.ganancia_inversionista, 
              ganancia_administrador: selectedInversionista.ganancia_administrador
            }),
          }
        )
        const result2 = await response2.json();

        if (!response2.ok) throw new Error(result2.error || "Error guardando prestamo-inversionista");
      }
      
      setSuccess(id ? "Préstamo modificado exitosamente" : "Préstamo creado exitosamente");

      // ✅ Call onSave if it's present (used in modal)
      if (onSave) {
        onSave(result as Prestamo);
      } else {
        // ✅ Otherwise, redirect (used in standalone page)
        setTimeout(() => {
          router.push("/prestamo");
        }, 1500);
      }

    } catch (err: unknown) {
      // Check if the error is an instance of Error
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

  const filteredPlazoOptions = tipoPrestamoNombre === "Reditos"
    ? ["Indefinido"]
    : plazoOptions?.filter((p) => p !== "Indefinido");
  
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
                {inv.id_inversionista} — {inv.inversionista?.nombre_completo}
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
            <option value="">Selecciona un intermediario</option>
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
            <option value="">Selecciona un aval</option>
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
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Tasa de Interés</label>
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
            {filteredPlazoOptions?.map((p) => (
              <option key={p} value={p}>
                {p}
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
    </div>
  );
}
