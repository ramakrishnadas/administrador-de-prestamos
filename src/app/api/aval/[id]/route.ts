import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Aval } from '@/app/lib/defintions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Aval>`
            SELECT * FROM aval WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Aval not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching aval' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre_completo, nro_telefono, domicilio, domicilio_laboral, link_comprobante, ocupacion } = await request.json();

        const data = await sql`
            UPDATE aval
            SET nombre_completo = ${nombre_completo}, nro_telefono = ${nro_telefono}, domicilio = ${domicilio}, domicilio_laboral = ${domicilio_laboral}, link_comprobante = ${link_comprobante}, ocupacion = ${ocupacion}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, nombre_completo, nro_telefono, domicilio, domicilio_laboral, link_comprobante, ocupacion;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Aval not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating aval' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM aval WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Aval not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Aval deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting aval' }, { status: 500 });
    }
}
