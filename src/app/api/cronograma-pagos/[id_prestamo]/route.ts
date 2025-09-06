import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { CronogramaPagos } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
    try {
        const { id_prestamo } = await params;

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }
        
        const data = await sql<CronogramaPagos>`
            SELECT * FROM cronograma_pagos WHERE id_prestamo = ${id_prestamo} ORDER BY numero_cuota;
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Cronograma-Pagos not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching Cronograma-Pagos' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
    try {
        const { cronogramaPagos } = await request.json();
        const { id_prestamo } = await params;

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }

        if (!Array.isArray(cronogramaPagos)) {
            return NextResponse.json({ error: 'cronogramaPagos must be an array' }, { status: 400 });
        }

        // Con @vercel/postgres, manejamos la transacción manualmente
        const insertedRows = [];

        try {
            // Iniciar transacción
            await sql`BEGIN`;

            for (const pago of cronogramaPagos) {
                const {
                    numero_cuota,
                    fecha_limite,
                    saldo_capital_inicial,
                    pago_capital,
                    pago_interes,
                    monto_cuota,
                    saldo_capital_final,
                    estado = 'pendiente'
                } = pago;

                if (!numero_cuota || !fecha_limite || saldo_capital_inicial === undefined || 
                    pago_capital === undefined || pago_interes === undefined || 
                    monto_cuota === undefined || saldo_capital_final === undefined) {
                    throw new Error('Missing required fields in payment schedule item');
                }

                const result = await sql`
                    INSERT INTO cronograma_pagos (
                        id_prestamo, 
                        numero_cuota, 
                        fecha_limite, 
                        saldo_capital_inicial, 
                        pago_capital, 
                        pago_interes, 
                        monto_cuota, 
                        saldo_capital_final, 
                        estado
                    )
                    VALUES (
                        ${parseInt(id_prestamo, 10)},
                        ${numero_cuota},
                        ${fecha_limite},
                        ${saldo_capital_inicial},
                        ${pago_capital},
                        ${pago_interes},
                        ${monto_cuota},
                        ${saldo_capital_final},
                        ${estado}
                    )
                    RETURNING *;
                `;
                
                insertedRows.push(result.rows[0]);
            }

            // Commit de la transacción
            await sql`COMMIT`;
            return NextResponse.json(insertedRows, { status: 201 });

        } catch (error) {
            // Rollback en caso de error
            await sql`ROLLBACK`;
            throw error;
        }

    } catch (error) {
        console.error('Error creando Cronograma-Pagos:', error);
        return NextResponse.json(
            { error: 'Error creando Cronograma-Pagos: ' + (error instanceof Error ? error.message : 'Error desconocido') }, 
            { status: 500 }
        );
    }
}
