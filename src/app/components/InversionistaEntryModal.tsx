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
  const [gananciaInv, setGananciaInv] = useState("100"); // Start with 100% for investor
  const [gananciaAdm, setGananciaAdm] = useState("0"); // Start with 0% for admin

  useEffect(() => {
    fetchInversionistas().then(setExistingInversionistas);
  }, []);

  const handleInversionistaSave = async (newInversionista: Inversionista) => {
    setExistingInversionistas([...existingInversionistas, newInversionista]);
    setSelectedId(newInversionista.id);
    setTempInversionista(null);
    setShowInversionistaModal(false);
  };

  const handleGananciaInvChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (numValue > 100) {
      // If user tries to input more than 100, cap it at 100
      setGananciaInv("100");
      setGananciaAdm("0");
    } else if (numValue < 0) {
      // If user tries to input negative, set to 0
      setGananciaInv("0");
      setGananciaAdm("100");
    } else {
      setGananciaInv(value);
      // Automatically calculate admin gain as 100 - investor gain
      setGananciaAdm(String(100 - numValue));
    }
  };

  const handleGananciaAdmChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (numValue > 100) {
      // If user tries to input more than 100, cap it at 100
      setGananciaAdm("100");
      setGananciaInv("0");
    } else if (numValue < 0) {
      // If user tries to input negative, set to 0
      setGananciaAdm("0");
      setGananciaInv("100");
    } else {
      setGananciaAdm(value);
      // Automatically calculate investor gain as 100 - admin gain
      setGananciaInv(String(100 - numValue));
    }
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
      ganancia_inversionista: String(parseFloat(gananciaInv) / 100),
      ganancia_administrador: String(parseFloat(gananciaAdm) / 100),
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
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Monto Invertido
              </label>
              <input
                type="number"
                min="0"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-sm w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Ganancia Inversionista
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={gananciaInv}
                  onChange={(e) => handleGananciaInvChange(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-sm w-full"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Ganancia Administrador
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={gananciaAdm}
                  onChange={(e) => handleGananciaAdmChange(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-sm w-full"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Display total percentage */}
          <div className="text-center text-sm text-gray-600">
            Total: {parseFloat(gananciaInv) + parseFloat(gananciaAdm)}%
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