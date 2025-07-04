import { Aval } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<Aval>`
            SELECT * FROM aval;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching avales'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { nombre_completo, nro_telefono, domicilio, domicilio_laboral, link_comprobante, ocupacion } = await request.json();
        
        const data = await sql<Aval>`
            INSERT INTO aval (nombre_completo, nro_telefono, domicilio, domicilio_laboral, link_comprobante, ocupacion)
            VALUES (${nombre_completo}, ${nro_telefono}, ${domicilio}, ${domicilio_laboral}, ${link_comprobante}, ${ocupacion})
            RETURNING id, nombre_completo, nro_telefono, domicilio, domicilio_laboral, link_comprobante, ocupacion;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating aval' }, { status: 500 });
    }
}