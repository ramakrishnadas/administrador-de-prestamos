import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Pago } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Pago>`
            SELECT * FROM pago WHERE id_prestamo = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Pagos not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching pagos' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { id_prestamo, metodo_de_pago, monto_pagado, estatus, fecha } = await request.json();

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }

        const data = await sql`
            UPDATE pago
            SET id_prestamo = ${id_prestamo}, metodo_de_pago = ${metodo_de_pago}, monto_pagado = ${monto_pagado}, estatus = ${estatus}, fecha = ${fecha}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, id_prestamo, metodo_de_pago, monto_pagado, estatus, fecha;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Pago not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating pago' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM pago WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Pago not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Pago deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting pago' }, { status: 500 });
    }
}
