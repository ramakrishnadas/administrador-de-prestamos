import { useEffect, useState } from "react";
import {
  Inversionista,
  PrestamoInversionistaWithDetails,
} from "../lib/defintions";
import { fetchInversionistas } from "../lib/helpers";
import { EntityModal } from "./EntityModal";
import InversionistaForm from "./InversionistaForm";

export function InversionistaEntryModal({
  onSave,
  onCancel,
}: {
  onSave: (entry: PrestamoInversionistaWithDetails) => void;
  onCancel: () => void;
}) {
  const [existingInversionistas, setExistingInversionistas] = useState<
    Inversionista[]
  >([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showInversionistaModal, setShowInversionistaModal] = useState(false);
  const [tempInversionista, setTempInversionista] =
    useState<Inversionista | null>(null);

  const [monto, setMonto] = useState("");
  const [gananciaInv, setGananciaInv] = useState("");
  const [gananciaAdm, setGananciaAdm] = useState("");

  useEffect(() => {
    fetchInversionistas().then(setExistingInversionistas);
  }, []);

  const handleInversionistaSave = async (newInversionista: Inversionista) => {
    setExistingInversionistas([...existingInversionistas, newInversionista]);
    setSelectedId(newInversionista.id);
    setTempInversionista(null);
    setShowInversionistaModal(false);
  };

  const handleSubmit = () => {
    const inversionista = existingInversionistas.find(
      (i) => i.id === selectedId
    );
    if (!inversionista) return;

    onSave({
      id_inversionista: inversionista.id,
      inversionista,
      monto_invertido: monto,
      ganancia_inversionista: gananciaInv,
      ganancia_administrador: gananciaAdm,
    });
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full relative max-h-[90vh] overflow-y-auto space-y-4">
        <h3 className="text-lg font-bold text-gray-800">
          Agregar Inversionista
        </h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Seleccionar Inversionista
          </label>
          <select
            onChange={(e) => setSelectedId(Number(e.target.value))}
            value={selectedId ?? ""}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="">Seleccionar...</option>
            {existingInversionistas.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.nombre_completo}
              </option>
            ))}
          </select>
          <button
            className="text-sm text-blue-600 hover:underline cursor-pointer"
            onClick={() => setShowInversionistaModal(true)}
          >
            ➕ Nuevo Inversionista
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              min="0"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Monto invertido"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
            <input
              type="number"
              min="0.1"
              step={0.1}
              required
              value={gananciaInv}
              onChange={(e) => setGananciaInv(e.target.value)}
              placeholder="Ganancia inversionista"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
            <input
              type="number"
              min="0.1"
              step={0.1}
              required
              value={gananciaAdm}
              onChange={(e) => setGananciaAdm(e.target.value)}
              placeholder="Ganancia administrador"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedId}
              className={`px-4 py-2 rounded cursor-pointer ${
                !selectedId
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Guardar
            </button>
          </div>
        </form>

        {showInversionistaModal && (
          <EntityModal
            visible={showInversionistaModal}
            onClose={() => setShowInversionistaModal(false)}
            initialData={tempInversionista ?? undefined}
            onSave={handleInversionistaSave}
            FormComponent={InversionistaForm}
          />
        )}
      </div>
    </div>
  );
}
