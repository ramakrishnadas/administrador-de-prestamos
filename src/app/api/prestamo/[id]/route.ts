import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Prestamo } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Prestamo>`
            SELECT * FROM prestamo WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching prestamo' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

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

        const data = await sql`
            UPDATE prestamo
            SET id_cliente = ${id_cliente}, id_tipo_prestamo = ${id_tipo_prestamo}, id_intermediario = ${idIntermediario}, monto = ${monto}, tasa_interes = ${tasa_interes}, plazo = ${plazo}, saldo = ${saldo}, fecha_inicio = ${fechaInicio}, fecha_fin = ${fechaFin}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, id_cliente, id_tipo_prestamo, id_intermediario, monto, tasa_interes, plazo, saldo, fecha_inicio, fecha_fin;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo not found' }, { status: 404 });
        }

        // Update records in prestamo_inversionista
        const id_prestamo = result[0].id;

        const prestamoInversionistaResults = [];
        
        if (inversionistas) {
            
            for (const inversionista of inversionistas) {
                const dataInversionista = await sql`
                    UPDATE prestamo_inversionista
                    SET monto_invertido = ${inversionista.monto_invertido}, ganancia_inversionista = ${inversionista.ganancia_inversionista}, ganancia_administrador = ${inversionista.ganancia_administrador}
                    WHERE id_prestamo = ${id_prestamo} AND id_inversionista = ${inversionista.id_inversionista}
                    RETURNING *;
                `;
                prestamoInversionistaResults.push(...dataInversionista.rows);
            }
        }

        return NextResponse.json(
            { 
                prestamo: result[0], 
                prestamo_inversionista: prestamoInversionistaResults 
            }, 
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating prestamo' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM prestamo WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Prestamo deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting prestamo' }, { status: 500 });
    }
}
