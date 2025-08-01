export type Usuario = {
    id: number;
    nombre_completo: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export type Inversionista = {
    id: number;
    nombre_completo: string;
    email: string;
    fecha_registro: Date;
    saldo: string;
	created_at: Date;
	updated_at: Date;
};

export type Intermediario = {
    id: number;
    nombre_completo: string;
    email: string;
    nro_telefono: string;
    created_at: Date;
	updated_at: Date;
}

export type PlazoPrestamo =  "Indefinido" | "Semanal" | "Quincenal" | "Mensual";

export type Prestamo = {
    id: number;
    id_cliente: number;
    id_tipo_prestamo: number;
    id_intermediario: number | null;
    id_aval: number | null;
    monto: string;
    tasa_interes: string;
    periodicidad: PlazoPrestamo;
    plazo: number;
    saldo: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    created_at: Date;
	updated_at: Date;
}

export type PrestamoInversionista = {
    id_prestamo: number;
    id_inversionista: number;
    monto_invertido: string;
    ganancia_inversionista: string;
    ganancia_administrador: string;
}

export type Cliente = {
    id: number;
    nombre_completo: string;
    email: string;
    nro_telefono: string;
    direccion: string;
    ocupacion: string;
    domicilio_laboral: string;
    link_comprobante: string;
    created_at: Date;
	updated_at: Date;
}

export type TipoPrestamo = {
    id: number;
    nombre: string;
    descripcion: string;
}

type Estatus = "Pendiente" | "Realizado" | "Atrasado" |"Abonado";

export type Pago = {
    id: number;
    id_prestamo: number;
    metodo_de_pago: string;
    monto_pagado: string;
    estatus: Estatus;
    fecha: Date;
    created_at: Date;
    updated_at: Date;
}

export type Aval = {
    id: number;
    nombre_completo: string;
    nro_telefono: string;
    domicilio: string;
    domicilio_laboral: string;
    link_comprobante: string;
    ocupacion: string;
    created_at: Date;
	updated_at: Date;
}

export type PrestamoInversionistaWithDetails = {
    id_inversionista: number;
    inversionista: Inversionista;
    monto_invertido: string;
    ganancia_inversionista: string;
    ganancia_administrador: string;
};