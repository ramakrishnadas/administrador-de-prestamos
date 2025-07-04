"use client"

import { useQuery } from "@tanstack/react-query";
import { Cliente, Pago } from "../lib/defintions";
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClientes, fetchPagos, formatDate } from "../lib/helpers";
import Link from "next/link";
import FilterComponent from "../components/FilterComponent";

export default function ClientesPage() {
  
  const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

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

  const { data: pagos, isLoading } = useQuery({ queryKey: ["pago"], queryFn: fetchPagos });

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  const columns = [
    { name: 'ID de Préstamo', selector: (row: Pago) => row.id_prestamo, width: "120px" },
    { name: 'Método de Pago', selector: (row: Pago) => row.metodo_de_pago, sortable: true, grow: 2},
    { name: 'Monto Pagado', selector: (row: Pago) => row.monto_pagado },
    { name: 'Estatus', selector: (row: Pago) => row.estatus, wrap: true, grow: 2},
    { name: 'Fecha', selector: (row: Pago) => {
        const fecha = new Date(row.fecha);
        const formattedDate = formatDate(fecha);
        return formattedDate;

        }, grow: 2 
    },
     
    // {
    //   name: '',
    //   cell: (row: Cliente) => (
    //     <Link href={`/aval/${row.id}/editar`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
    //       Editar
    //     </Link>
    //   ),
    // },
  ];

	const filteredItems = pagos.filter(
		(p: Pago) => p.id_prestamo && String(p.id_prestamo).toLowerCase().includes(filterText.toLowerCase())
	);

    return (
        <div className="mx-20">
          <h1 className="text-xl font-bold m-8">Pagos</h1>
          <Link href="/pago/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Pago</Link>
          
          <DataTable
              title=""
              columns={columns}
              data={filteredItems}
              pagination
              paginationResetDefaultPage={resetPaginationToggle}
              subHeader
              subHeaderComponent={subHeaderComponentMemo}
              persistTableHead
              highlightOnHover
              pointerOnHover
              striped
          />
        
        </div>
  );
}