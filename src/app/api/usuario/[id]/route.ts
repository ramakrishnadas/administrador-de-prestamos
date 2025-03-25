import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Usuario } from '@/app/lib/defintions';
import bcrypt from 'bcrypt';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }
        
        const data = await sql<Usuario>`
            SELECT * FROM usuario WHERE id = ${id};
        `;
        const result = data.rows;
        
        if (result.length === 0) {
            return NextResponse.json({ error: 'Usuario not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching usuario' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Need to add validation
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const { nombre_completo, email, password } = await request.json();

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await sql`
            UPDATE usuario
            SET nombre_completo = ${nombre_completo}, email = ${email}, password = ${hashedPassword}, updated_at = now()
            WHERE id = ${id}
            RETURNING id, nombre_completo, email, password;
        `;

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Usuario not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating usuario' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const data = await sql`
            DELETE FROM usuario WHERE id = ${id} RETURNING id;
        `;
        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Usuario not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Usuario deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting usuario' }, { status: 500 });
    }
}
