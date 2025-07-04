import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { TipoPrestamo } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<TipoPrestamo>`
            SELECT * FROM tipo_prestamo WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Tipo de préstamo not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching tipo de préstamo' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre, descripcion } = await request.json();

        const data = await sql`
            UPDATE cliente
            SET nombre = ${nombre}, descripcion = ${descripcion}
            WHERE id = ${id}
            RETURNING id, nombre, descripcion;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Tipo de préstamo not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating tipo de préstamo' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM tipo_prestamo WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Tipo de préstamo not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tipo de préstamo deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting tipo de préstamo' }, { status: 500 });
    }
}
