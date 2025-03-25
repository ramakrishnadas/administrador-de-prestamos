import { Inversionista } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<Inversionista>`
            SELECT * FROM inversionista;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching inversionista'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { nombre_completo, email, fecha_registro, saldo } = await request.json();

        const fechaRegistro = fecha_registro ? fecha_registro : new Date().toISOString();

        const data = await sql<Inversionista>`
            INSERT INTO inversionista (nombre_completo, email, fecha_registro, saldo)
            VALUES (${nombre_completo}, ${email}, ${fechaRegistro}, ${saldo})
            RETURNING id, nombre_completo, email, fecha_registro, saldo;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating inversionista' }, { status: 500 });
    }
}