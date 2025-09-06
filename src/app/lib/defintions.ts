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

export type Frequency = "semanal" | "quincenal" | "mensual";

export type Prestamo = {
    id: number;
    id_cliente: number;
    id_tipo_prestamo: number;
    id_intermediario: number | null;
    id_aval: number | null;
    monto: string;
    tasa_interes: string;
    periodicidad: Frequency;
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

export type Pago = {
    id: number;
    id_prestamo: number;
    metodo_de_pago: string;
    monto_capital: string;
    monto_interes: string;
    monto_total: string;
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

export interface Result {
  totalToPay: string;
  paymentPerPeriod: string;
}

export type PaymentScheduleRow = {
  numero_cuota: number;
  saldo_capital_inicial: string;
  pago_capital: string;
  pago_interes: string;
  monto_cuota: string;
  saldo_capital_final: string;
  fecha_limite: string;
};

type Estatus = "pendiente" | "pagado" | "atrasado" | "abonado" | "cancelado";

export type CronogramaPagos = {
    id: number;
    id_prestamo: number;
    numero_cuota: number;
    fecha_limite: Date;
    saldo_capital_inicial: string;
    pago_capital: string;
    pago_interes: string;
    monto_cuota: string;
    saldo_capital_final: string;
    estado: Estatus;
}