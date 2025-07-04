import { Aval, Cliente, Intermediario, Inversionista, Pago, Prestamo, PrestamoInversionista, TipoPrestamo } from "./defintions";

export const fetchClientes = async () => {
    const res = await fetch('/api/cliente');
    return res.json();
};

export const fetchInversionistas = async () => {
    const res = await fetch('/api/inversionista');
    return res.json();
}

export const fetchIntermediarios = async () => {
    const res = await fetch('/api/intermediario');
    return res.json();
};

export const fetchPagos = async () => {
    const res = await fetch('/api/pago');
    return res.json();
}

export const fetchPrestamos = async () => {
    const res = await fetch('/api/prestamo');
    return res.json();
}

export const fetchTiposPrestamo = async () => {
    const res = await fetch('/api/tipo_prestamo');
    return res.json();
};

export const fetchAvales = async () => {
    const res = await fetch('/api/aval');
    return res.json();
};

export async function fetchClienteById(id: string): Promise<Cliente | null> {
    const res = await fetch(`/api/cliente/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent clients
    if (!res.ok) throw new Error("Error fetching cliente");
  
    return res.json();
}

export async function fetchInversionistaById(id: string): Promise<Inversionista | null> {
    const res = await fetch(`/api/inversionista/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent inversionistas
    if (!res.ok) throw new Error("Error fetching inversionista");
  
    return res.json();
}

export async function fetchIntermediarioById(id: string): Promise<Intermediario | null> {
    const res = await fetch(`/api/intermediario/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent intermediarios
    if (!res.ok) throw new Error("Error fetching intermediario");
  
    return res.json();
}

export async function fetchTipoPrestamoById(id: string): Promise<TipoPrestamo | null> {
    const res = await fetch(`/api/tipo_prestamo/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent tipos de prestamo
    if (!res.ok) throw new Error("Error fetching tipo prestamo");
  
    return res.json();
}

export async function fetchAvalById(id: string): Promise<Aval | null> {
    const res = await fetch(`/api/aval/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent tipos de prestamo
    if (!res.ok) throw new Error("Error fetching aval");
  
    return res.json();
}

export async function fetchPrestamoById(id: string): Promise<Prestamo | null> {
    const res = await fetch(`/api/prestamo/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent prestamos
    if (!res.ok) throw new Error("Error fetching prestamo");
  
    return res.json();
}

export async function fetchPrestamoInversionistasByPrestamoId(id: string): Promise<PrestamoInversionista[] | null> {
    const res = await fetch(`/api/prestamo-inversionista/${id}`);
  
    if (res.status === 404) return null; // Return null for nonexistent prestamos
    if (!res.ok) throw new Error("Error fetching prestamo-inversionista");
  
    return res.json();
}

export function formatDate(fecha: Date) {
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = fecha.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

export async function getLastPaymentDate(id: number) {
    const res = await fetch('/api/pago');
    const pagosJSON: Pago[] = await res.json();

    const paymentsPrestamo = pagosJSON.filter( pago => pago.id_prestamo === id);

    const latestPayment = paymentsPrestamo.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0];

    return latestPayment?.fecha || null;
}