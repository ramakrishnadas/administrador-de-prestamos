import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Inversionista } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Inversionista>`
            SELECT * FROM inversionista WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Inversionista not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching inversionista' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre_completo, email, fecha_registro, saldo } = await request.json();

        const data = await sql`
            UPDATE inversionista
            SET nombre_completo = ${nombre_completo}, email = ${email}, fecha_registro = ${fecha_registro}, saldo = ${saldo}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, nombre_completo, email, fecha_registro, saldo;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Inversionista not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating inversionista' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM inversionista WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Inversionista not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Inversionista deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting inversionista' }, { status: 500 });
    }
}
