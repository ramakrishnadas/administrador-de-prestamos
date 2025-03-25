const sampleUser = {
    nombre_completo: 'Juan Perez',
    email: 'juan.perez@example.com',
    password: 'securePassword123', // In production, hash the password
};

const sampleInversionista = [
    {
      nombre_completo: 'Carlos Ruiz',
      email: 'carlos.ruiz@example.com',
      saldo: 15000.00,
    },
    {
      nombre_completo: 'Ana Gomez',
      email: 'ana.gomez@example.com',
      saldo: 25000.00,
    },
];

const sampleIntermediario = [
    {
      nombre_completo: 'Luis Fernandez',
      email: 'luis.fernandez@example.com',
      nro_telefono: '1234567890',
    },
    {
      nombre_completo: 'Marta Lopez',
      email: 'marta.lopez@example.com',
      nro_telefono: '0987654321',
    },
];
  
const sampleTipoPrestamo = [
  {
      nombre: 'Reditos',
      descripcion: 'Préstamo con intereses fijos generados sobre el monto prestado.',
  },
  {
      nombre: 'Financiamiento',
      descripcion: 'Préstamo con pagos que incluyen tanto el capital como los intereses.',
  },
];
  
const sampleCliente = [
    {
      nombre_completo: 'Jose Martinez',
      nro_telefono: '5551234567',
      direccion: 'Calle Falsa 123',
      email: 'jose.martinez@example.com',
    },
    {
      nombre_completo: 'Paula Alvarez',
      nro_telefono: '5557654321',
      direccion: 'Avenida Siempre Viva 456',
      email: 'paula.alvarez@example.com',
    },
];

const samplePrestamo = [
    {
      id_cliente: 1,
      id_tipo_prestamo: 2, // Assuming "Semanal" exists
      id_intermediario: 1,
      monto: 1000.00,
      tasa_interes: 0.05,
      plazo: 'Semanal',
      saldo: 1000.00,
      fecha_inicio: new Date(),
    },
    {
      id_cliente: 2,
      id_tipo_prestamo: 3, // Assuming "Quincenal" exists
      id_intermediario: 2,
      monto: 2000.00,
      tasa_interes: 0.03,
      plazo: 'Quincenal',
      saldo: 2000.00,
      fecha_inicio: new Date(),
    },
];

const samplePrestamoInversionista = [
    {
      id_prestamo: 1,
      id_inversionista: 1,
      monto_invertido: 500.00,
      ganancia_inversionista: 0.04,
      ganancia_administrador: 0.01,
    },
    {
      id_prestamo: 2,
      id_inversionista: 2,
      monto_invertido: 1000.00,
      ganancia_inversionista: 0.03,
      ganancia_administrador: 0.02,
    },
];
  
const samplePago = [
    {
      id_prestamo: 1,
      metodo_de_pago: 'Transferencia Bancaria',
      monto_pagado: 200.00,
      estatus: 'Realizado',
      fecha: new Date(),
    },
    {
      id_prestamo: 2,
      metodo_de_pago: 'Efectivo',
      monto_pagado: 300.00,
      estatus: 'Pendiente',
      fecha: new Date(),
    },
];
  
module.exports = {
    sampleCliente,
    sampleIntermediario,
    sampleInversionista,
    samplePago,
    samplePrestamo,
    samplePrestamoInversionista,
    sampleTipoPrestamo,
    sampleUser
}