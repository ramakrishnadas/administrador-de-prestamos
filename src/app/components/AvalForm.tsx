"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAvalById, fetchClienteById } from "../lib/helpers"
import { Aval } from "../lib/defintions";

type AvalFormProps = {
  onSave?: (cliente: Aval) => void;
  onCancel?: () => void;
  id?: string;
};

export default function AvalForm({ 
  onSave,
  onCancel,
  id,
}: AvalFormProps) {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    nro_telefono: "",
    domicilio: "",
    ocupacion: "",
    domicilio_laboral: "",
    link_comprobante: "",
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAvalById(id)
        .then((data) => {
          if (!data) {
            setError("Aval no encontrado.");
            return;
          }
          setFormData({
            nombre_completo: data.nombre_completo ?? "",
            nro_telefono: data.nro_telefono ?? "",
            domicilio: data.domicilio ?? "",
            ocupacion: data.ocupacion ?? "",
            domicilio_laboral: data.domicilio_laboral ?? "",
            link_comprobante: "",
          });
        })
        .catch((err) => {
          console.error(err);
          setError("Error al obtener datos del aval.")
        });
    }
  }, [id]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const method = id ? "PUT" : "POST";
      const response = await fetch(
        id ? `/api/aval/${id}` : "/api/aval",
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error guardando al aval");

      setSuccess(id ? "Aval modificado exitosamente" : "Aval creado exitosamente");

      // ✅ Call onSave if it's present (used in modal)
      if (onSave) {
        onSave(result as Aval);
      } else {
        // ✅ Otherwise, redirect (used in standalone page)
        setTimeout(() => {
          router.push("/aval");
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

  return (
    <div className="bg-white shadow-md rounded px-8 py-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-black">{id ? "Editar Aval" : "Registrar Aval"}</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre Completo</label>
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Número de Teléfono</label>
          <input
            type="text"
            name="nro_telefono"
            value={formData.nro_telefono}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Domicilio</label>
          <input
            type="text"
            name="direccion"
            value={formData.domicilio}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Ocupación</label>
          <input
            type="text"
            name="ocupacion"
            value={formData.ocupacion}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Domicilio Laboral</label>
          <input
            type="text"
            name="domicilio_laboral"
            value={formData.domicilio_laboral}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Recibo de Nómina/Estado de Cuenta Bancario (en proceso)</label>
          <input
            type="file"
            name="link_comprobante"
            value={formData.link_comprobante}
            onChange={handleChange}
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-2 bg-gray-300 text-black py-2 rounded hover:bg-gray-400 cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}
