"use client"

import { useState } from "react";
import DataTable from "react-data-table-component";

type Frequency = "semanal" | "quincenal" | "mensual";

type PaymentScheduleRow = {
  numero: number;               // Pago No.
  saldoCapital: string;         // Saldo Capital antes del pago, en formato string con dos decimales
  pagoCapital: string;          // Pago Capital en formato string
  pagoIntereses: string;        // Pago Intereses en formato string
  montoPago: string;            // Monto de Pago (capital + interés) en string
  plazoDias: number;            // Plazo en días (por periodo)
  saldoRestante: string;        // Saldo Capital Restante en string
  fecha: string;                // Fecha en formato local (string)
};

interface Result {
  totalToPay: string;
  paymentPerPeriod: string;
}

function generateAmortizationSchedule(
  principal: number,
  periodicRate: number,
  totalPayments: number,
  frequency: Frequency,
  startDate: Date = new Date()
) {
  const frequencyDays: Record<Frequency, number> = {
    semanal: 7,
    quincenal: 15,
    mensual: 30,
  };

  const daysPerPeriod = frequencyDays[frequency];

  const payment =
    principal *
    (periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
    (Math.pow(1 + periodicRate, totalPayments) - 1);

  let balance = principal;
  let schedule = [];

  for (let i = 1; i <= totalPayments; i++) {
    const interestPayment = balance * periodicRate;
    const principalPayment = payment - interestPayment;
    const remainingBalance = balance - principalPayment;

    const paymentDate = new Date(startDate);
    paymentDate.setDate(paymentDate.getDate() + daysPerPeriod * (i - 1));

    schedule.push({
      numero: i,
      saldoCapital: balance.toFixed(2),
      pagoCapital: principalPayment.toFixed(2),
      pagoIntereses: interestPayment.toFixed(2),
      montoPago: payment.toFixed(2),
      plazoDias: daysPerPeriod,
      saldoRestante: remainingBalance > 0 ? remainingBalance.toFixed(2) : "0.00",
      fecha: paymentDate.toLocaleDateString(),
    });

    balance = remainingBalance;
  }

  return schedule;
}


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
    periodicRate,
    numericTerm,
    frequency
  );
  setPaymentSchedule(schedule);
};


  const columns = [
    { name: "Pago No.", selector: (row: PaymentScheduleRow) => row.numero, sortable: true },
    { name: "Saldo Capital", selector: (row: PaymentScheduleRow) => `$${row.saldoCapital}` },
    { name: "Pago Capital", selector: (row: PaymentScheduleRow) => `$${row.pagoCapital}` },
    { name: "Pago Intereses", selector: (row: PaymentScheduleRow) => `$${row.pagoIntereses}` },
    { name: "Monto de Pago", selector: (row: PaymentScheduleRow) => `$${row.montoPago}` },
    { name: "Plazo en días", selector: (row: PaymentScheduleRow) => row.plazoDias },
    { name: "Saldo Capital Restante", selector: (row: PaymentScheduleRow) => `$${row.saldoRestante}` },
    { name: "Fecha", selector: (row: PaymentScheduleRow) => row.fecha },
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
            dense
            striped
          />
        </div>
      )}
    </>
    
  );
}
