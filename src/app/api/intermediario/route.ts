import { Intermediario } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<Intermediario>`
            SELECT * FROM intermediario;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: 'Error fetching intermediarios'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { nombre_completo, nro_telefono, email } = await request.json();
        
        const data = await sql<Intermediario>`
            INSERT INTO intermediario (nombre_completo, nro_telefono, email)
            VALUES (${nombre_completo}, ${nro_telefono}, ${email})
            RETURNING id, nombre_completo, nro_telefono, email;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating intermediario' }, { status: 500 });
    }
}