import { useEffect, useState } from "react";
import { CronogramaPagos } from "../lib/defintions";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rowData: CronogramaPagos | null;
  loanType: string; // "Financiamiento" o "Réditos"
  onSave?: (pago: any) => void;
};

export default function PaymentModal({ isOpen, onClose, rowData, loanType, onSave }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    id_prestamo: "",
    numero_cuota: 0,
    metodo_de_pago: "efectivo",
    monto_total: "0",
    fecha: new Date().toISOString().split("T")[0],
    monto_capital: "0",
    monto_interes: "0",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && rowData) {
      setFormData({
        id_prestamo: String(rowData.id_prestamo),
        numero_cuota: rowData.numero_cuota,
        metodo_de_pago: "efectivo",
        monto_total: rowData.monto_cuota,
        fecha: new Date().toISOString().split("T")[0],
        monto_capital: rowData.pago_capital,
        monto_interes: rowData.pago_interes,
      });
      setError(null);
    }
  }, [isOpen, rowData]); // ← Se ejecuta cuando isOpen o rowData cambian

  // Calcular diferencia para Réditos
  const calculateReditosFields = (montoTotal: string) => {
    const total = parseFloat(montoTotal) || 0;
    const interes = parseFloat(formData.monto_interes) || 0;
    const capital = total - interes;
    
    return {
      monto_capital: Math.max(0, capital).toFixed(2),
      monto_interes: interes.toFixed(2),
      monto_total: total.toFixed(2)
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (loanType === "Reditos" && name === "monto_total") {
      const newFields = calculateReditosFields(value);
      setFormData(prev => ({
        ...prev,
        ...newFields,
        [name]: value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validación para Réditos
    if (loanType === "Reditos") {
      const montoTotal = parseFloat(formData.monto_total);
      const montoInteres = parseFloat(formData.monto_interes);
      
      if (montoTotal < montoInteres) {
        setError(`El monto total debe ser al menos $${montoInteres.toFixed(2)}`);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/registrar-pago/${rowData?.id_prestamo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al registrar pago');

      const result = await response.json();
      
      if (onSave) onSave(result);
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rowData) return null;

  const isReditos = loanType === "Reditos";
  const montoInteres = parseFloat(formData.monto_interes);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Registrar Pago - Cuota #{rowData.numero_cuota}
          </h2>
          <p className="text-sm text-gray-600 mb-4">Tipo: {loanType}</p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* Campos pre-llenados automáticamente */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Cuota
                </label>
                <input
                  type="number"
                  name="numero_cuota"
                  value={formData.numero_cuota}
                  readOnly
                  className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Total {isReditos && "*"}
                </label>
                <input
                  type="number"
                  name="monto_total"
                  value={formData.monto_total}
                  onChange={handleChange}
                  readOnly={!isReditos}
                  required
                  min={isReditos ? montoInteres : undefined}
                  step="0.01"
                  className={`w-full border border-gray-300 px-3 py-2 rounded ${
                    !isReditos ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {isReditos && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo: ${montoInteres.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital
                </label>
                <input
                  type="number"
                  name="monto_capital"
                  value={formData.monto_capital}
                  readOnly
                  className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interés
                </label>
                <input
                  type="number"
                  name="monto_interes"
                  value={formData.monto_interes}
                  readOnly
                  className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {isReditos && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  💡 Para Réditos: El pago mínimo es el interés (${montoInteres.toFixed(2)}). 
                  Si pagas más, el excedente se aplicará al capital.
                </p>
              </div>
            )}

            {/* Campos editables */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                name="metodo_de_pago"
                value={formData.metodo_de_pago}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar Pago"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}