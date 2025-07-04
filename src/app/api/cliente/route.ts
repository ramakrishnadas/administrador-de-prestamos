import { Cliente } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<Cliente>`
            SELECT * FROM cliente;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching clientes'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { nombre_completo, nro_telefono, direccion, email, ocupacion, domicilio_laboral, link_comprobante } = await request.json();
        
        const data = await sql<Cliente>`
            INSERT INTO cliente (nombre_completo, nro_telefono, direccion, email, ocupacion, domicilio_laboral, link_comprobante)
            VALUES (${nombre_completo}, ${nro_telefono}, ${direccion}, ${email}, ${ocupacion}, ${domicilio_laboral}, ${link_comprobante})
            RETURNING id, nombre_completo, nro_telefono, direccion, email, ocupacion, domicilio_laboral, link_comprobante;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating cliente' }, { status: 500 });
    }
}