import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Prestamo } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        console.error(error);
        return NextResponse.json({ error: 'Error fetching prestamo' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { id_cliente, id_tipo_prestamo, id_intermediario, id_aval, monto, tasa_interes, periodicidad, plazo, saldo, fecha_inicio, fecha_fin } = await request.json();

        if (isNaN(parseInt(id_cliente, 10))) {
            return NextResponse.json({ error: 'Invalid id_cliente' }, { status: 400 });
        }

        if (isNaN(parseInt(id_tipo_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_tipo_prestamos' }, { status: 400 });
        }

        if (id_intermediario != "" && isNaN(parseInt(id_intermediario, 10))) {
            return NextResponse.json({ error: 'Invalid id_intermediario' }, { status: 400 });
        }

        if (id_aval != "" && isNaN(parseInt(id_aval, 10))) {
            return NextResponse.json({ error: 'Invalid id_aval' }, { status: 400 });
        }

        const idIntermediario = id_intermediario ? id_intermediario : null;
        const idAval = id_aval ? id_aval : null;
        const fechaInicio = fecha_inicio ? fecha_inicio : new Date().toISOString();
        const fechaFin = fecha_fin ? fecha_fin : null;

        const data = await sql`
            UPDATE prestamo
            SET id_cliente = ${id_cliente}, id_tipo_prestamo = ${id_tipo_prestamo}, id_intermediario = ${idIntermediario}, id_aval = ${idAval}, monto = ${monto}, tasa_interes = ${tasa_interes}, periodicidad = ${periodicidad}, plazo = ${plazo}, saldo = ${saldo}, fecha_inicio = ${fechaInicio}, fecha_fin = ${fechaFin}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, id_cliente, id_tipo_prestamo, id_intermediario, id_aval, monto, tasa_interes, periodicidad, plazo, saldo, fecha_inicio, fecha_fin;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo not found' }, { status: 404 });
        }
        
        return NextResponse.json(
            { 
                prestamo: result[0],
            }, 
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating prestamo' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
        console.error(error);
        return NextResponse.json({ error: 'Error deleting prestamo' }, { status: 500 });
    }
}
