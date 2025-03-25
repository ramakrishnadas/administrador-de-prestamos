import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Cliente } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Cliente>`
            SELECT * FROM cliente WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching cliente' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre_completo, nro_telefono, direccion, email } = await request.json();

        const data = await sql`
            UPDATE cliente
            SET nombre_completo = ${nombre_completo}, nro_telefono = ${nro_telefono}, direccion = ${direccion}, email = ${email}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, nombre_completo, nro_telefono, direccion, email;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating cliente' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM cliente WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Cliente not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Cliente deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting cliente' }, { status: 500 });
    }
}
