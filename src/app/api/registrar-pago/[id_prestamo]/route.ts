import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { updateReditosFutureSchedule } from '@/app/lib/helpers';

export async function POST(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
try {

    const { id_prestamo } = await params;

    if (isNaN(parseInt(id_prestamo, 10))) {
        return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
    }

    const { numero_cuota, metodo_de_pago, monto_capital, monto_interes, monto_total, fecha } = await request.json();

    // Validaciones
    if (!id_prestamo || !monto_total || !fecha || monto_capital === undefined || monto_interes === undefined || !metodo_de_pago) {
      return NextResponse.json({ error: 'Campos obligatorios vacíos' }, { status: 400 });
    }

    await sql`BEGIN`;

    try {
      // 1. PRIMERO: Obtener información del préstamo incluyendo el tipo
      const datosPrestamo = await sql`
        SELECT
            p.id_tipo_prestamo,
            tp.nombre as tipo_prestamo_nombre
        FROM prestamo p
        LEFT JOIN tipo_prestamo tp ON p.id_tipo_prestamo = tp.id
        WHERE p.id = ${id_prestamo};
        `;

        if (datosPrestamo.rows.length === 0) {
            throw new Error('Préstamo no encontrado');
        }

        const { 
            tipo_prestamo_nombre,  
        } = datosPrestamo.rows[0];

      // 2. Insertar pago
      const paymentResult = await sql`
        INSERT INTO pago (id_prestamo, metodo_de_pago, monto_total, fecha, monto_capital, monto_interes)
        VALUES (${id_prestamo}, ${metodo_de_pago}, ${monto_total}, ${fecha}, ${monto_capital}, ${monto_interes})
        RETURNING *;
      `;

      // 3. Actualizar saldo del préstamo (solo si se pagó capital)
      if (monto_capital > 0) {
        await sql`
          UPDATE prestamo 
          SET saldo = saldo - ${monto_capital}
          WHERE id = ${id_prestamo};
        `;
      }

      // 4. Marcar la cuota como pagada
      await sql`
        UPDATE cronograma_pagos 
        SET estado = 'pagado', id_pago = ${paymentResult.rows[0].id}
        WHERE id_prestamo = ${id_prestamo} AND numero_cuota = ${numero_cuota};
      `;

      // 5. ✅ SOLO recalcular si es Réditos y se pagó capital adicional
      if (tipo_prestamo_nombre === 'Reditos') {
        // Actualizar saldo y monto del prestamo
        await sql`
          UPDATE prestamo 
          SET monto = monto - ${monto_capital}
          WHERE id = ${id_prestamo};
        `;

        // Obtener saldo actual
        const saldoActualResult = await sql`
          SELECT saldo FROM prestamo WHERE id = ${id_prestamo};
        `;
        const saldoActual = saldoActualResult.rows[0].saldo;

        if (saldoActual > 0) {
          await updateReditosFutureSchedule(parseInt(id_prestamo));
        } else {
          // Cancelar cuotas pendientes si ya no hay deuda
          await sql`
            UPDATE cronograma_pagos 
            SET estado = 'cancelado'
            WHERE id_prestamo = ${id_prestamo} AND estado = 'pendiente';
          `;
        }
      }

      await sql`COMMIT`;

      return NextResponse.json({
        message: 'Pago registrado exitosamente',
        payment: paymentResult.rows[0],
      }, { status: 200 });

    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }

    } catch (error) {
        console.error('Error procesando pago:', error);
        return NextResponse.json(
        { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Error desconocido') },
        { status: 500 }
        );
    }
}