import { TipoPrestamo } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<TipoPrestamo>`
            SELECT * FROM tipo_prestamo;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching tipos de préstamo'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { nombre, descripcion } = await request.json();
        
        const data = await sql<TipoPrestamo>`
            INSERT INTO tipo_prestamo (nombre, descripcion)
            VALUES (${nombre}, ${descripcion})
            RETURNING id, nombre, descripcion;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating tipo de préstamo' }, { status: 500 });
    }
}