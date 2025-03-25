import { Pago } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql<Pago>`
            SELECT * FROM pago;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: 'Error fetching pago'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { id_prestamo, metodo_de_pago, monto_pagado, estatus, fecha } = await request.json();

        if (isNaN(parseInt(id_prestamo, 10))) {
            return NextResponse.json({ error: 'Invalid id_prestamo' }, { status: 400 });
        }

        const fechaPrestamo = fecha ? fecha : new Date().toISOString();

        const data = await sql<Pago>`
            INSERT INTO pago (id_prestamo, metodo_de_pago, monto_pagado, estatus, fecha)
            VALUES (${id_prestamo}, ${metodo_de_pago}, ${monto_pagado}, ${estatus}, ${fechaPrestamo})
            RETURNING id, id_prestamo, metodo_de_pago, monto_pagado, estatus, fecha;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error creating pago' }, { status: 500 });
    }
}