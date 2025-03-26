import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { PrestamoInversionista } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
    try {
        const { id_prestamo } = await params;

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }
        
        const data = await sql<PrestamoInversionista>`
            SELECT * FROM prestamo_inversionista WHERE id_prestamo = ${id_prestamo};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo-Inversionista not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching prestamo-inversionista' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
    // Need to add data validation
    try {
        const { id_inversionista, monto_invertido, ganancia_inversionista, ganancia_administrador } = await request.json();

        const { id_prestamo } = await params;

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }

        const data = await sql<PrestamoInversionista>`
            INSERT INTO prestamo_inversionista (id_prestamo, id_inversionista, monto_invertido, ganancia_inversionista, ganancia_administrador)
            VALUES (${id_prestamo}, ${id_inversionista}, ${monto_invertido}, ${ganancia_inversionista}, ${ganancia_administrador})
            RETURNING *;
        `;
        const result = data.rows;
        
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating prestamo-inversionista' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
    try {
        // Need to add validation
        const { id_prestamo } = await params;

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }

        const { id_inversionista, monto_invertido, ganancia_inversionista, ganancia_administrador } = await request.json();

        const data = await sql`
            UPDATE prestamo_inversionista
            SET monto_invertido = ${monto_invertido}, ganancia_inversionista = ${ganancia_inversionista}, ganancia_administrador = ${ganancia_administrador}
            WHERE id_prestamo = ${id_prestamo} AND id_inversionista = ${id_inversionista}
            RETURNING *;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo-Inversionista not found' }, { status: 404 });
        }

        return NextResponse.json(result[0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating prestamo-inversionista' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id_prestamo: string }> }) {
    try {
        const { id_prestamo } = await params;
        const { id_inversionista } = await request.json();

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM prestamo_inversionista 
            WHERE id_prestamo = ${id_prestamo} AND id_inversionista = ${id_inversionista}
            RETURNING id_prestamo, id_inversionista;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Prestamo-Inversionista not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Prestamo-Inversionista deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting prestamo-inversionista' }, { status: 500 });
    }
}
