import { sql } from "@vercel/postgres";
import { Aval, Cliente, CronogramaPagos, Intermediario, Inversionista, Pago, Prestamo, PrestamoInversionista, TipoPrestamo } from "./defintions";
import { Frequency } from "./defintions";

export const fetchClientes = async () => {
    const res = await fetch('/api/cliente');
    return res.json();
};

export const fetchInversionistas = async () => {
    const res = await fetch('/api/inversionista');
    return res.json();
}

export const fetchIntermediarios = async () => {
    const res = await fetch('/api/intermediario');
    return res.json();
};

export const fetchPagos = async () => {
    const res = await fetch('/api/pago');
    return res.json();
}

export const fetchPrestamos = async () => {
    const res = await fetch('/api/prestamo');
    return res.json();
}

export const fetchTiposPrestamo = async () => {
    const res = await fetch('/api/tipo_prestamo');
    return res.json();
};

export const fetchAvales = async () => {
    const res = await fetch('/api/aval');
    return res.json();
};

export async function fetchClienteById(id: string): Promise<Cliente | null> {
    const res = await fetch(`/api/cliente/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent clients
    if (!res.ok) throw new Error("Error fetching cliente");
  
    return res.json();
}

export async function fetchPagosById(id: string): Promise<Pago[] | null> {
    const res = await fetch(`/api/pago/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent pagos
    if (!res.ok) throw new Error("Error fetching pago");
  
    return res.json();
}

export async function fetchInversionistaById(id: string): Promise<Inversionista | null> {
    const res = await fetch(`/api/inversionista/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent inversionistas
    if (!res.ok) throw new Error("Error fetching inversionista");
  
    return res.json();
}

export async function fetchIntermediarioById(id: string): Promise<Intermediario | null> {
    const res = await fetch(`/api/intermediario/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent intermediarios
    if (!res.ok) throw new Error("Error fetching intermediario");
  
    return res.json();
}

export async function fetchTipoPrestamoById(id: string): Promise<TipoPrestamo | null> {
    const res = await fetch(`/api/tipo_prestamo/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent tipos de prestamo
    if (!res.ok) throw new Error("Error fetching tipo prestamo");
  
    return res.json();
}

export async function fetchAvalById(id: string): Promise<Aval | null> {
    const res = await fetch(`/api/aval/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent tipos de prestamo
    if (!res.ok) throw new Error("Error fetching aval");
  
    return res.json();
}

export async function fetchPrestamoById(id: string): Promise<Prestamo | null> {
    const res = await fetch(`/api/prestamo/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent prestamos
    if (!res.ok) throw new Error("Error fetching prestamo");
  
    return res.json();
}

export async function fetchPrestamoInversionistasByPrestamoId(id: string): Promise<PrestamoInversionista[] | null> {
    const res = await fetch(`/api/prestamo-inversionista/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent prestamos
    if (!res.ok) throw new Error("Error fetching prestamo-inversionista");
  
    return res.json();
}

export async function fetchCronogramaById(id_prestamo: string): Promise<CronogramaPagos[] | null> {
    const res = await fetch(`/api/cronograma-pagos/${id_prestamo}`);
  
    if (res.status === 404) return null; // Return null for nonexistent tipos de prestamo
    if (!res.ok) throw new Error("Error fetching cronograma de pagos");
  
    return res.json();
}

export function formatDate(fecha: Date) {
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = fecha.getFullYear();
    if (!day || !month || !year) return "";
    
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

export function getDaysBetweenDateStrings(dateStr1: string, dateStr2: string): number {
    // Parse the formatted strings back to Date objects
    const parseFormattedDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const date1 = parseFormattedDate(dateStr1);
    const date2 = parseFormattedDate(dateStr2);
    
    // Calculate difference in milliseconds and convert to days
    const diffMs = date2.getTime() - date1.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

export async function getLastPaymentDate(id: number) {
    const res = await fetch('/api/pago');
    const pagosJSON: Pago[] = await res.json();

    const paymentsPrestamo = pagosJSON.filter( pago => pago.id_prestamo === id);

    const latestPayment = paymentsPrestamo.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0];

    return latestPayment?.fecha || null;
}

export function calcularProximaFechaRecurrente(
  fechaBase: Date, 
  diaMesDeseado: number
): Date {
  // Validar que el día deseado esté en rango válido
  if (diaMesDeseado < 1 || diaMesDeseado > 31) {
    throw new Error('El día deseado debe estar entre 1 y 31');
  }

  // Crear una nueva fecha usando el constructor local
  const fechaCalculada = new Date(
    fechaBase.getFullYear(),
    fechaBase.getMonth(),
    fechaBase.getDate()
  );
  
  const mes = fechaCalculada.getMonth();
  
  // Obtener el último día del mes actual
  const ultimoDiaDelMes = getUltimoDiaDelMes(fechaCalculada);
  
  // Ajustar el día si es mayor al último día del mes
  const diaAjustado = Math.min(diaMesDeseado, ultimoDiaDelMes);
  
  // Establecer la fecha calculada con el día ajustado
  fechaCalculada.setDate(diaAjustado);
  
  // Si la fecha calculada es anterior a la fecha base, avanzar al próximo mes
  if (fechaCalculada < fechaBase) {
    fechaCalculada.setMonth(mes + 1);
    
    // Recalcular para el nuevo mes por si el día deseado no existe
    const nuevoUltimoDia = getUltimoDiaDelMes(fechaCalculada);
    const nuevoDiaAjustado = Math.min(diaMesDeseado, nuevoUltimoDia);
    
    fechaCalculada.setDate(nuevoDiaAjustado);
  }
  
  return fechaCalculada;
}

function getUltimoDiaDelMes(fecha: Date): number {
  // Usar constructor local para evitar problemas de timezone
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  totalPayments: number,
  frequency: Frequency,
  startDate: Date = new Date()
) {
  const diaPagoFijo = startDate.getDate();

  // 1. Calcular la tasa periódica según la frecuencia - FORMA CORRECTA
  let periodicRate: number;
  
  switch (frequency) {
    case 'mensual':
      periodicRate = (annualInterestRate / 100) / 12;
      break;
    case 'quincenal':
      periodicRate = (annualInterestRate / 100) / 24;
      break;
    case 'semanal':
      periodicRate = (annualInterestRate / 100) / 52;
      break;
    default:
      periodicRate = (annualInterestRate / 100) / 12; // default mensual
  }

  // 2. Calcular el pago periódico exacto
  const paymentExact = principal * 
    (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / 
    (Math.pow(1 + periodicRate, totalPayments) - 1);

  // 3. Usar números enteros (centavos) para precisión
  let balanceCents = Math.round(principal * 100);
  const paymentCents = Math.round(paymentExact * 100);
  const schedule = [];

  // 4. Calcular el pago total en centavos para verificación
  let totalPrincipalCents = 0;
  let totalInterestCents = 0;

  for (let i = 1; i <= totalPayments; i++) {
    // Calcular en centavos para precisión
    const interestCents = Math.round(balanceCents * periodicRate);
    let principalCents = paymentCents - interestCents;
    let remainingBalanceCents = balanceCents - principalCents;

    // Ajustar última cuota para que el balance sea exactamente 0
    if (i === totalPayments) {
      principalCents = balanceCents; // Usar el balance exacto
      remainingBalanceCents = 0; // Forzar a cero
    }

    // Acumular para verificación
    totalPrincipalCents += principalCents;
    totalInterestCents += interestCents;

    // Convertir de centavos a dólares
    const balance = balanceCents / 100;
    const interestPayment = interestCents / 100;
    const principalPayment = principalCents / 100;
    const remainingBalance = remainingBalanceCents / 100;
    const payment = principalPayment + interestPayment;

    // Calcular fecha
    let paymentDate;
    if (frequency === 'mensual') {
      const fechaBase = new Date(startDate);
      fechaBase.setMonth(startDate.getMonth() + i);
      paymentDate = calcularProximaFechaRecurrente(fechaBase, diaPagoFijo);
    } else {
      const daysPerPeriod: Record<Frequency, number> = {
        semanal: 7,
        quincenal: 15,
        mensual: 30
      };
      const daysToAdd = daysPerPeriod[frequency] * i;
      paymentDate = new Date(startDate);
      paymentDate.setDate(startDate.getDate() + daysToAdd);
    }

    schedule.push({
      numero_cuota: i,
      saldo_capital_inicial: balance.toFixed(2),
      pago_capital: principalPayment.toFixed(2),
      pago_interes: interestPayment.toFixed(2),
      monto_cuota: payment.toFixed(2),
      saldo_capital_final: remainingBalance.toFixed(2),
      fecha_limite: paymentDate.toISOString().split('T')[0],
    });

    balanceCents = remainingBalanceCents;
  }

  // 5. Verificación final de que todo cuadre
  const totalPaidCents = totalPrincipalCents + totalInterestCents;
  const totalExpectedCents = paymentCents * totalPayments;
  const discrepancyCents = totalPaidCents - totalExpectedCents;

  if (Math.abs(discrepancyCents) > 1) {
    console.warn(`⚠️ Discrepancia de ${discrepancyCents/100} centavos detectada`);
  }

  // 6. Ajuste final para asegurar que la última cuota tenga balance 0
  if (schedule.length > 0) {
    const lastPayment = schedule[schedule.length - 1];
    if (parseFloat(lastPayment.saldo_capital_final) !== 0) {
      schedule[schedule.length - 1] = {
        ...lastPayment,
        saldo_capital_final: "0.00",
        pago_capital: (parseFloat(lastPayment.pago_capital) + parseFloat(lastPayment.saldo_capital_final)).toFixed(2),
        monto_cuota: (parseFloat(lastPayment.monto_cuota) + parseFloat(lastPayment.saldo_capital_final)).toFixed(2)
      };
    }
  }

  return schedule;
}

export function generateReditosSchedule(
  principal: number,
  monthlyInterestRate: number,
  numberOfPeriodsToProject: number,
  frequency: Frequency,
  startDate: Date = new Date()
) {
  const periodicRate = monthlyInterestRate / 100;
  const balance = principal;
  const schedule = [];

  // Validate startDate
  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid start date provided');
  }

  console.log('Starting schedule generation with:', {
    startDate: startDate.toString(),
    startDateISO: startDate.toISOString(),
    frequency,
    periods: numberOfPeriodsToProject
  });

  for (let i = 1; i <= numberOfPeriodsToProject; i++) {
    const interestPayment = parseFloat((balance * periodicRate).toFixed(2));
    const minPayment = interestPayment;
    const principalPayment = 0;

    let paymentDate: Date;
    
    if (frequency === 'mensual') {
      // SIMPLE AND ROBUST: Use the first day of the month and then set the day
      const baseDate = new Date(startDate);
      
      // Calculate target month and year
      const targetMonth = baseDate.getMonth() + i;
      const targetYear = baseDate.getFullYear() + Math.floor(targetMonth / 12);
      const finalMonth = targetMonth % 12;
      
      // Get the last day of the target month to ensure we don't exceed it
      const lastDayOfMonth = new Date(targetYear, finalMonth + 1, 0).getDate();
      const paymentDay = Math.min(baseDate.getDate(), lastDayOfMonth);
      
      // Create the payment date safely
      paymentDate = new Date(targetYear, finalMonth, paymentDay);
      
      console.log(`Period ${i} date calculation:`, {
        baseDate: baseDate.toString(),
        targetYear,
        targetMonth: finalMonth,
        paymentDay,
        paymentDate: paymentDate.toString(),
        isValid: !isNaN(paymentDate.getTime())
      });
      
    } else {
      const daysPerPeriod: Record<Exclude<Frequency, 'mensual'>, number> = {
        semanal: 7,
        quincenal: 15
      };
      
      paymentDate = new Date(startDate);
      paymentDate.setDate(startDate.getDate() + (daysPerPeriod[frequency] * i));
    }

    // Validate paymentDate
    if (isNaN(paymentDate.getTime())) {
      console.error('Invalid payment date calculated - using fallback:', {
        startDate: startDate.toString(),
        frequency,
        period: i,
        calculatedDate: paymentDate
      });
      
      // Fallback: use simple date addition
      paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);
      
      // If still invalid, use current date + months
      if (isNaN(paymentDate.getTime())) {
        paymentDate = new Date();
        paymentDate.setMonth(paymentDate.getMonth() + i);
      }
    }

    // Format the date as YYYY-MM-DD for database
    const formattedDate = formatDateForDB(paymentDate);
    
    schedule.push({
      numero_cuota: i,
      saldo_capital_inicial: balance.toFixed(2),
      pago_capital: principalPayment.toFixed(2),
      pago_interes: interestPayment.toFixed(2),
      monto_cuota: minPayment.toFixed(2),
      saldo_capital_final: balance.toFixed(2),
      fecha_limite: formattedDate,
    });
  }

  console.log('Successfully generated schedule with', schedule.length, 'periods');
  return schedule;
}

// Helper function to format date as YYYY-MM-DD for database
function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTitleCaseWord(word: string): string {
  if (!word) return word; // handle empty string
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export async function updateReditosFutureSchedule(id_prestamo: number) {
  try {
    // 1. Obtener información completa del préstamo
    const datosPrestamo = await sql`
      SELECT saldo, tasa_interes, periodicidad, fecha_inicio 
      FROM prestamo WHERE id = ${id_prestamo};
    `;
    const { saldo: nuevoSaldo, tasa_interes, periodicidad, fecha_inicio } = datosPrestamo.rows[0];

     console.log('updateReditosFutureSchedule - fecha_inicio from DB:', {
      fecha_inicio,
      type: typeof fecha_inicio,
      parsed: new Date(fecha_inicio).toString()
    });

    // 2. Obtener todas las cuotas pendientes
    const pendingSchedules = await sql`
      SELECT id, fecha_limite, numero_cuota
      FROM cronograma_pagos 
      WHERE id_prestamo = ${id_prestamo} AND estado = 'pendiente'
      ORDER BY fecha_limite ASC;
    `;

    const nuevoSaldoNum = parseFloat(nuevoSaldo);
    const nuevoInteres = parseFloat((nuevoSaldo * tasa_interes).toFixed(2));

    // 3. Si hay cuotas pendientes, actualizarlas
    if (pendingSchedules.rows.length > 0) {
      for (const schedule of pendingSchedules.rows) {
        await sql`
          UPDATE cronograma_pagos 
          SET 
            saldo_capital_inicial = ${nuevoSaldoNum},
            pago_interes = ${nuevoInteres},
            monto_cuota = ${nuevoInteres},
            saldo_capital_final = ${nuevoSaldo}
          WHERE id = ${schedule.id};
        `;
      }
    } else {
      // 4. ✅ SI NO HAY CUOTAS PENDIENTES, CREAR NUEVAS
      await createNewReditosSchedules(id_prestamo, nuevoSaldoNum, tasa_interes, periodicidad, fecha_inicio);
    }

  } catch (error) {
    console.error('Error updating Réditos future schedule:', error);
    throw error;
  }
}

async function createNewReditosSchedules(
  id_prestamo: number, 
  nuevoSaldo: number, 
  tasa_interes: number, 
  periodicidad: Frequency,
  nuevaFechaInicio: string | Date // Accept both string and Date
) {
  try {
    let startDate: Date;

    // Handle different input types
    if (nuevaFechaInicio instanceof Date) {
      startDate = nuevaFechaInicio;
    } else {
      // If it's a string, parse it
      startDate = new Date(nuevaFechaInicio);
    }

    // Better validation
    if (isNaN(startDate.getTime())) {
      console.error('Invalid start date received:', {
        input: nuevaFechaInicio,
        type: typeof nuevaFechaInicio,
        parsed: startDate
      });
      throw new Error(`Invalid start date: ${String(nuevaFechaInicio)}`);
    }

    console.log('Creating new schedules with:', {
      startDate: startDate.toString(),
      startDateISO: startDate.toISOString(),
      localDate: formatDateForDB(startDate)
    });

    // 1. Obtener la última cuota para saber el próximo número
    const lastSchedule = await sql`
      SELECT numero_cuota, fecha_limite
      FROM cronograma_pagos 
      WHERE id_prestamo = ${id_prestamo}
      ORDER BY numero_cuota DESC
      LIMIT 1;
    `;

    const nextCuotaNumber = lastSchedule.rows.length > 0 
      ? lastSchedule.rows[0].numero_cuota + 1 
      : 1;

    // Use the last payment date as start date if available, otherwise use loan start date
    let effectiveStartDate = startDate;
    if (lastSchedule.rows.length > 0 && lastSchedule.rows[0].fecha_limite) {
      const lastDate = new Date(lastSchedule.rows[0].fecha_limite);
      if (!isNaN(lastDate.getTime())) {
        effectiveStartDate = lastDate;
      }
    }

    console.log('Generating new Réditos schedules with:', {
      effectiveStartDate: effectiveStartDate.toString(),
      balance: nuevoSaldo,
      rate: tasa_interes,
      frequency: periodicidad
    });

    // 2. Generar el nuevo cronograma usando la función existente
    const newSchedules = generateReditosSchedule(
      nuevoSaldo,
      tasa_interes * 100,
      6, // Proyectar 6 periodos
      periodicidad,
      effectiveStartDate
    );

    // 3. Ajustar los números de cuota y preparar para inserción
    const schedulesToInsert = newSchedules.map((schedule, index) => ({
      id_prestamo: id_prestamo,
      numero_cuota: nextCuotaNumber + index,
      fecha_limite: schedule.fecha_limite,
      saldo_capital_inicial: parseFloat(schedule.saldo_capital_inicial),
      pago_capital: parseFloat(schedule.pago_capital),
      pago_interes: parseFloat(schedule.pago_interes),
      monto_cuota: parseFloat(schedule.monto_cuota),
      saldo_capital_final: parseFloat(schedule.saldo_capital_final),
      estado: 'pendiente'
    }));

    // 4. Insertar todas las nuevas cuotas en lote
    for (const schedule of schedulesToInsert) {
      await sql`
        INSERT INTO cronograma_pagos (
          id_prestamo, numero_cuota, fecha_limite, 
          saldo_capital_inicial, pago_capital, pago_interes,
          monto_cuota, saldo_capital_final, estado
        ) VALUES (
          ${schedule.id_prestamo}, ${schedule.numero_cuota}, ${schedule.fecha_limite},
          ${schedule.saldo_capital_inicial}, ${schedule.pago_capital}, ${schedule.pago_interes},
          ${schedule.monto_cuota}, ${schedule.saldo_capital_final}, ${schedule.estado}
        );
      `;
    }

    console.log(`Successfully created ${schedulesToInsert.length} new Réditos schedules`);

  } catch (error) {
    console.error('Error creando nuevo cronograma de Réditos:', error);
    throw error;
  }
}
