import { Prestamo } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<Prestamo>`
            SELECT * FROM prestamo;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching prestamo'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { id_cliente, id_tipo_prestamo, id_intermediario, monto, tasa_interes, plazo, saldo, fecha_inicio, fecha_fin, inversionistas } = await request.json();

        if (isNaN(parseInt(id_cliente, 10))) {
            return NextResponse.json({ error: 'Invalid id_cliente' }, { status: 400 });
        }

        if (isNaN(parseInt(id_tipo_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_tipo_prestamos' }, { status: 400 });
        }

        if (id_intermediario && isNaN(parseInt(id_intermediario, 10))) {
            return NextResponse.json({ error: 'Invalid id_intermediario' }, { status: 400 });
        }
        
        const idIntermediario = id_intermediario ? id_intermediario : null;
        const fechaInicio = fecha_inicio ? fecha_inicio : new Date().toISOString();
        const fechaFin = fecha_fin ? fecha_fin : null;

        const data = await sql<Prestamo>`
            INSERT INTO prestamo (id_cliente, id_tipo_prestamo, id_intermediario, monto, tasa_interes, plazo, saldo, fecha_inicio, fecha_fin)
            VALUES (${id_cliente}, ${id_tipo_prestamo}, ${idIntermediario}, ${monto}, ${tasa_interes}, ${plazo}, ${saldo}, ${fechaInicio}, ${fechaFin})
            RETURNING id, id_cliente, id_tipo_prestamo, id_intermediario, monto, tasa_interes, plazo, saldo, fecha_inicio, fecha_fin;
        `;
        const result = data.rows;

        // Create records in prestamo_inversionista
        const id_prestamo = result[0].id;

        const prestamoInversionistaResults = [];
        for (const inversionista of inversionistas) {
            const dataInversionista = await sql`
                INSERT INTO prestamo_inversionista (id_prestamo, id_inversionista, monto_invertido, ganancia_inversionista, ganancia_administrador)
                VALUES (${id_prestamo}, ${inversionista.id_inversionista}, ${inversionista.monto_invertido}, ${inversionista.ganancia_inversionista}, ${inversionista.ganancia_administrador})
                RETURNING *;
            `;
            prestamoInversionistaResults.push(...dataInversionista.rows);
        }
        
        return NextResponse.json(
            { 
                prestamo: result[0], 
                prestamo_inversionista: prestamoInversionistaResults 
            }, 
            { status: 201 }
        );
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error creating prestamo' }, { status: 500 });
    }
}