import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Intermediario } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Intermediario>`
            SELECT * FROM intermediario WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Intermediario not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching intermediario' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre_completo, nro_telefono, email } = await request.json();

        const data = await sql`
            UPDATE intermediario
            SET nombre_completo = ${nombre_completo}, nro_telefono = ${nro_telefono}, email = ${email}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, nombre_completo, nro_telefono, email;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Intermediario not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating intermediario' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM intermediario WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Intermediario not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Intermediario deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting intermediario' }, { status: 500 });
    }
}
