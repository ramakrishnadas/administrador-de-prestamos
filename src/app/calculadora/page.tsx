"use client"

import { useState } from "react";

type Frequency = "semanal" | "quincenal" | "mensual";

interface Result {
  totalToPay: string;
  paymentPerPeriod: string;
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState<number | "">("");
  const [annualInterestRate, setAnnualInterestRate] = useState<number | "">("");
  const [frequency, setFrequency] = useState<Frequency>("mensual");
  const [term, setTerm] = useState<number | "">("");
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    if (amount === "" || annualInterestRate === "" || term === "") return;

    const periodsPerYear: Record<Frequency, number> = {
      semanal: 52,
      quincenal: 24,
      mensual: 12,
    };

    const periods = periodsPerYear[frequency];
    const periodicRate = (annualInterestRate / 100) / periods;

    const totalInterest = amount * periodicRate * term;
    const totalToPay = amount + totalInterest;
    const paymentPerPeriod = totalToPay / term;

    setResult({
      totalToPay: totalToPay.toFixed(2),
      paymentPerPeriod: paymentPerPeriod.toFixed(2),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Calculadora de Préstamo</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Monto del préstamo:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Tasa de interés anual (%):</label>
        <input
          type="number"
          value={annualInterestRate}
          onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
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
          onChange={(e) => setTerm(Number(e.target.value))}
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
          <p><strong>Pago por {frequency}:</strong> ${result.paymentPerPeriod}</p>
        </div>
      )}
    </div>
  );
}
