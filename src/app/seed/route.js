import { db } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { 
    sampleCliente,
    sampleIntermediario,
    sampleInversionista,
    samplePago,
    samplePrestamo,
    samplePrestamoInversionista,
    sampleTipoPrestamo,
    sampleUser 
} from '../lib/placeholder-data';

async function seedData(client) {
    try {
        // Create "usuario" table for authentication
        await client.sql`
        CREATE TABLE IF NOT EXISTS usuario (
            id SERIAL PRIMARY KEY,
            nombre_completo TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        console.log('Created "usuario" table');

        // Create "inversionista" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS inversionista (
            id SERIAL PRIMARY KEY,
            nombre_completo TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            fecha_registro TIMESTAMP DEFAULT NOW(),
            saldo DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        console.log('Created "inversionista" table');

        // Create "intermediario" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS intermediario (
            id SERIAL PRIMARY KEY,
            nombre_completo TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            nro_telefono TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        console.log('Created "intermediario" table');

        // Create "aval" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS aval (
            id SERIAL PRIMARY KEY,
            nombre_completo TEXT NOT NULL,
            nro_telefono TEXT NOT NULL,
            domicilio TEXT NOT NULL,
            domicilio_laboral TEXT NOT NULL,
            link_comprobante TEXT,
            ocupacion TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        console.log('Created "aval" table');

        // Create "cliente" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS cliente (
            id SERIAL PRIMARY KEY,
            nombre_completo TEXT NOT NULL,
            nro_telefono TEXT NOT NULL,
            direccion TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            ocupacion TEXT,
            domicilio_laboral TEXT,
            link_comprobante TEXT
        );
        `;
        console.log('Created "cliente" table');

        // Create "tipo_prestamo" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS tipo_prestamo (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT NOT NULL
        );
        `;
        console.log('Created "tipo_prestamo" table');

        // Create "prestamo" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS prestamo (
            id SERIAL PRIMARY KEY,
            id_cliente INT REFERENCES cliente(id),
            id_tipo_prestamo INT REFERENCES tipo_prestamo(id),
            id_intermediario INT REFERENCES intermediario(id) NULL,
            id_aval INT REFERENCES aval(id) NULL;
            monto DECIMAL(10, 2) NOT NULL,
            tasa_interes DECIMAL(5, 4) NOT NULL,
            periodicidad TEXT CHECK (plazo IN ('Indefinido', 'Semanal', 'Quincenal', 'Mensual')),
            plazo INT DEFAULT NULL,
            saldo DECIMAL(10, 2) NOT NULL,
            fecha_inicio TIMESTAMP NOT NULL,
            fecha_fin TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        console.log('Created "prestamo" table');

        // Create "prestamo_inversionista" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS prestamo_inversionista (
            id_prestamo INT REFERENCES prestamo(id),
            id_inversionista INT REFERENCES inversionista(id),
            monto_invertido DECIMAL(10, 2) NOT NULL,
            ganancia_inversionista DECIMAL(5, 4) NOT NULL,
            ganancia_administrador DECIMAL(5, 4) NOT NULL,
            PRIMARY KEY (id_prestamo, id_inversionista)
        );
        `;
        console.log('Created "prestamo_inversionista" table');

        // Create "pago" table
        await client.sql`
        CREATE TABLE IF NOT EXISTS pago (
            id SERIAL PRIMARY KEY,
            id_prestamo INT REFERENCES prestamo(id),
            metodo_de_pago TEXT NOT NULL,
            monto_pagado DECIMAL(10, 2) NOT NULL,
            estatus TEXT CHECK (estatus IN ('Pendiente', 'Realizado', 'Atrasado', 'Abonado')) NOT NULL,
            fecha TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        console.log('Created "pago" table');

        // Seed sample data into tables

        // Insert sample user data into "usuario" table
        const hashedPassword = await bcrypt.hash(sampleUser.password, 10);
        // Insert sample data into "usuario" table
        await client.sql`
            INSERT INTO usuario (nombre_completo, email, password)
            VALUES 
            (${sampleUser.nombre_completo}, ${sampleUser.email}, ${hashedPassword})
            ON CONFLICT (email) DO NOTHING;
        `;
        console.log('Seeded "usuario" table');

        // Insert sample data into "inversionista" table
        for (const inversionista of sampleInversionista) {
        await client.sql`
            INSERT INTO inversionista (nombre_completo, email, saldo)
            VALUES (${inversionista.nombre_completo}, ${inversionista.email}, ${inversionista.saldo})
            ON CONFLICT (email) DO NOTHING;
        `;
        }
        console.log('Seeded "inversionista" table');

        // Insert sample data into "intermediario" table
        for (const intermediario of sampleIntermediario) {
        await client.sql`
            INSERT INTO intermediario (nombre_completo, email, nro_telefono)
            VALUES (${intermediario.nombre_completo}, ${intermediario.email}, ${intermediario.nro_telefono})
            ON CONFLICT (email) DO NOTHING;
        `;
        }
        console.log('Seeded "intermediario" table');

        // Insert sample data into "tipo_prestamo" table
        for (const tipoPrestamo of sampleTipoPrestamo) {
        await client.sql`
            INSERT INTO tipo_prestamo (nombre, descripcion)
            VALUES (${tipoPrestamo.nombre}, ${tipoPrestamo.descripcion})
            ON CONFLICT (nombre) DO NOTHING;
        `;
        }
        console.log('Seeded "tipo_prestamo" table');

        // Insert sample data into "cliente" table
        for (const cliente of sampleCliente) {
        await client.sql`
            INSERT INTO cliente (nombre_completo, nro_telefono, direccion, email)
            VALUES (${cliente.nombre_completo}, ${cliente.nro_telefono}, ${cliente.direccion}, ${cliente.email})
            ON CONFLICT (email) DO NOTHING;
        `;
        }
        console.log('Seeded "cliente" table');

        // Insert sample data into "prestamo" table
        for (const prestamo of samplePrestamo) {
        await client.sql`
            INSERT INTO prestamo (id_cliente, id_tipo_prestamo, id_intermediario, monto, tasa_interes, plazo, saldo, fecha_inicio, fecha_fin)
            VALUES (${prestamo.id_cliente}, ${prestamo.id_tipo_prestamo}, ${prestamo.id_intermediario}, ${prestamo.monto}, ${prestamo.tasa_interes}, ${prestamo.plazo}, ${prestamo.saldo}, ${prestamo.fecha_inicio}, ${prestamo.fecha_fin});
        `;
        }
        console.log('Seeded "prestamo" table');

        // Insert sample data into "prestamo_inversionista" table
        for (const prestamoInversionista of samplePrestamoInversionista) {
        await client.sql`
            INSERT INTO prestamo_inversionista (id_prestamo, id_inversionista, monto_invertido, ganancia_inversionista, ganancia_administrador)
            VALUES (${prestamoInversionista.id_prestamo}, ${prestamoInversionista.id_inversionista}, ${prestamoInversionista.monto_invertido}, ${prestamoInversionista.ganancia_inversionista}, ${prestamoInversionista.ganancia_administrador});
        `;
        }
        console.log('Seeded "prestamo_inversionista" table');

        // Insert sample data into "pago" table
        for (const pago of samplePago) {
        await client.sql`
            INSERT INTO pago (id_prestamo, metodo_de_pago, monto_pagado, estatus, fecha)
            VALUES (${pago.id_prestamo}, ${pago.metodo_de_pago}, ${pago.monto_pagado}, ${pago.estatus}, ${pago.fecha});
        `;
        }
        console.log('Seeded "pago" table');

        console.log('Seeded sample data into all tables');

    } catch (error) {
        console.error('Error creating tables or seeding data:', error);
        throw error;
    }
}

async function main() {
    const client = await db.connect();

    // Seed the data (create tables and insert data)
    await seedData(client);

    await client.end();
}

main().catch((err) => {
    console.error(
        'An error occurred while attempting to seed the database:',
        err
    );
});
