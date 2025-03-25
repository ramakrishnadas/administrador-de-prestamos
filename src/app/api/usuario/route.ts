import { Usuario } from '@/app/lib/defintions';
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        const data = await sql<Usuario>`
            SELECT * FROM usuario;
        `;
        const result = data.rows;
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching usuarios'}, { status: 500});
    }
}

export async function POST(request: Request) {
    // Need to add data validation
    try {
        const { nombre_completo, email, password } = await request.json();
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await sql<Usuario>`
            INSERT INTO usuario (nombre_completo, email, password)
            VALUES (${nombre_completo}, ${email}, ${hashedPassword})
            RETURNING id, nombre_completo, email, password;
        `;
        const result = data.rows;
        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating usuario' }, { status: 500 });
    }
}