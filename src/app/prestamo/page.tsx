"use client"

import { useQuery } from "@tanstack/react-query";
import { Cliente, Prestamo, TipoPrestamo } from "../lib/defintions";
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClientes, fetchPrestamos, fetchTiposPrestamo, formatDate, getLastPaymentDate } from "../lib/helpers";
import Link from "next/link";
import FilterComponent from "../components/FilterComponent";

function FechaUltimoPagoCell({ id }: { id: number }) {
  const [fecha, setFecha] = React.useState<Date | null | undefined>(undefined);

  React.useEffect(() => {
    let isMounted = true;

    getLastPaymentDate(id).then((result) => {
      if (isMounted) setFecha(result ?? null); // Explicitly set null if no date found
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (fecha === undefined) return <span>Cargando...</span>;
  if (fecha === null) return <span>N/A</span>;

  return <span>{fecha ? formatDate(new Date(fecha)) : 'Cargando...'}</span>;
}

export default function PrestamosPage() {
  
  const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const [tipoPrestamoFilter, setTipoPrestamoFilter] = React.useState<'Todos' | 'Financiamiento' | 'Reditos'>('Todos');

  const subHeaderComponentMemo = React.useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};

		return (
			<FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />
		);
	}, [filterText, resetPaginationToggle]);

  const { data: prestamos, isLoading: isLoadingPrestamos } = useQuery({ queryKey: ["prestamo"], queryFn: fetchPrestamos });

  const { data: tipoprestamos, isLoading: isLoadingTipoPrestamos } = useQuery({ queryKey: ["tipo_prestamo"], queryFn: fetchTiposPrestamo });

  const { data: clientes, isLoading: isLoadingClientes } = useQuery({ queryKey: ["cliente"], queryFn: fetchClientes })

  if (isLoadingPrestamos || isLoadingTipoPrestamos || isLoadingClientes) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  

  const columns = [
    { name: 'ID', selector: (row: Prestamo) => row.id, width: "80px" },
    { name: 'Cliente', selector: (row: Prestamo) => {
        const cliente = clientes?.find( (c: Cliente) => c.id === row.id_cliente);
        return cliente?.nombre_completo;
      }, 
      sortable: true, grow: 3
    },
    { name: 'Tipo de Préstamo', selector: (row: Prestamo) => {
        const tipoPrestamo = tipoprestamos?.find( (tipo: TipoPrestamo) => tipo.id === row.id_tipo_prestamo);
        return tipoPrestamo?.nombre;
      }, 
      grow: 2,
      sortable: true 
    },
    { name: 'Monto', selector: (row: Prestamo) => row.monto, // Keep this as a number for sorting
      sortable: true,
      format: (row: Prestamo) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.monto)),
      sortFunction: (a: Prestamo, b: Prestamo) => parseFloat(a.monto) - parseFloat(b.monto) // Ensure numeric sorting
    },
    { name: 'Tasa de Interés', selector: (row: Prestamo) => (parseFloat(row.tasa_interes) * 100).toFixed(1) + "%", wrap: true, grow: 2 },
    { name: 'Periodicidad', selector: (row: Prestamo) => row.periodicidad, wrap: true},
    { name: 'Plazo', selector: (row: Prestamo) => row.plazo },
    { name: 'Saldo', selector: (row: Prestamo) => row.saldo, // Keep this as a number for sorting
      sortable: true,
      format: (row: Prestamo) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(row.saldo)),
      sortFunction: (a: Prestamo, b: Prestamo) => parseFloat(a.saldo) - parseFloat(b.saldo) // Ensure numeric sorting
    },
    // { name: 'Fecha de Inicio', selector: (row: Prestamo) => {
    //     const fecha = new Date(row.fecha_inicio);
    //     const formattedDate = formatDate(fecha);
    //     return formattedDate;
    //   },
    //   grow: 1.5
    // },
    // { name: 'Fecha de Fin', selector: (row: Prestamo) => {
    //     if (row.fecha_fin) {
    //       const fecha = new Date(row.fecha_fin);
    //       const formattedDate = formatDate(fecha);
    //       return formattedDate;
    //     } else {
    //       return "N/A";
    //     }
    //   },
    //   grow: 1.5
    // },
    { name: 'Último Pago', 
      cell: (row: Prestamo) => <FechaUltimoPagoCell id={row.id} />,
      grow: 1.5
    },
    {
      name: '',
      cell: (row: Prestamo) => (
        <Link href={`/prestamo/${row.id}/editar`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
      ),
    },
  ];

	const filteredItems = prestamos.filter((p: Prestamo) => {
    const cliente = clientes?.find((c: Cliente) => c.id === p.id_cliente);
    const clientName = cliente ? cliente.nombre_completo.toLowerCase() : '';

    const lowerFilter = filterText.toLowerCase();
    const matchesTextFilter =
      clientName.includes(lowerFilter)

    const matchesTipoPrestamoFilter =
      tipoPrestamoFilter === 'Todos' ||
      (tipoPrestamoFilter === 'Financiamiento' && p.id_tipo_prestamo === 2) ||
      (tipoPrestamoFilter === 'Reditos' && p.id_tipo_prestamo === 1);

    return matchesTextFilter && matchesTipoPrestamoFilter;
  });

    return (
      <div className="mx-20">
        <h1 className="text-xl font-bold m-8">Préstamos</h1>
        <Link href="/prestamo/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Préstamo</Link>
        
        <label htmlFor="redimido-filter" className="text-base font-medium text-gray-700">
          Filtrar por tipo de préstamo:
        </label>
        <select
          id="tipo-prestamo-filter"
          value={tipoPrestamoFilter}
          onChange={(e) => setTipoPrestamoFilter(e.target.value as 'Todos' | 'Financiamiento' | 'Reditos')}
          className="border border-gray-300 rounded-md p-1 text-base ml-4 cursor-pointer"
        >
          <option value="Todos">Todos</option>
          <option value="Financiamiento">Financiamiento</option>
          <option value="Reditos">Reditos</option>
        </select>
        <DataTable
            title=""
            columns={columns}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
            onRowClicked={(row) => window.location.href = `/prestamo/${row.id}`}
            highlightOnHover
            pointerOnHover
            striped
        />
      </div>
  );
}