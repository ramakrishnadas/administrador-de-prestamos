"use client"

import { useState } from "react";
import DataTable from "react-data-table-component";
import { Frequency, PaymentScheduleRow, Result } from "../lib/defintions";
import { formatDate, generateAmortizationSchedule } from "../lib/helpers";


export default function LoanCalculator() {
  const [amount, setAmount] = useState<string>("");
  const [annualInterestRate, setAnnualInterestRate] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("mensual");
  const [term, setTerm] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleRow[]>([]);

  const calculate = () => {
    const numericAmount = parseFloat(amount);
    const numericRate = parseFloat(annualInterestRate);
    const numericTerm = parseFloat(term);

    if (isNaN(numericAmount) || isNaN(numericRate) || isNaN(numericTerm)) return;

    const periodsPerYear: Record<Frequency, number> = {
      semanal: 52,
      quincenal: 24,
      mensual: 12,
    };

    const periods = periodsPerYear[frequency];
    const periodicRate = (numericRate / 100) / periods;

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
      numericTerm,
      frequency
    );
    setPaymentSchedule(schedule);
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
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Calculadora de Préstamo</h2>

        <div className="mb-4">
          <label className="block font-medium mb-1">Monto del préstamo:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Tasa de interés anual (%):</label>
          <input
            type="number"
            value={annualInterestRate}
            onChange={(e) => setAnnualInterestRate(e.target.value)}
            step={0.01}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Periodicidad:</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">
            Plazo ({frequency === "semanal" ? "semanas" : frequency === "quincenal" ? "quincenas" : "meses"}):
          </label>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <button
          onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition cursor-pointer"
        >
          Calcular
        </button>

        {result && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
            <p><strong>Total a pagar:</strong> ${result.totalToPay}</p>
            <p><strong>Pago {frequency}:</strong> ${result.paymentPerPeriod}</p>
          </div>
        )}
        
      </div>
      {paymentSchedule.length > 0 && (
        <div className="mx-20 mt-8">
          <h3 className="text-lg font-semibold mb-2">Desglose de Pagos</h3>
          <DataTable
            columns={columns}
            data={paymentSchedule}
            pagination
            paginationPerPage={15}
            dense
            striped
          />
        </div>
      )}
    </>
    
  );
}
