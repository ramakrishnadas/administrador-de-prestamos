"use client"

import { useQuery } from "@tanstack/react-query";
import { Inversionista } from "../lib/defintions";
import styled from 'styled-components';
import DataTable from "react-data-table-component";
import React from "react";
import { fetchInversionistas } from "../lib/helpers";
import Link from "next/link";
import FilterComponent from "../components/FilterComponent";

export default function InversionistasPage() {
  
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

  const { data: inversionistas, isLoading } = useQuery({ queryKey: ["inversionista"], queryFn: fetchInversionistas });

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  const columns = [
    { name: 'ID', selector: (row: Inversionista) => row.id, width: "80px" },
    { name: 'Nombre Completo', selector: (row: Inversionista) => row.nombre_completo, sortable: true, grow: 2},
    { name: 'Email', selector: (row: Inversionista) => row.email, grow: 2 },
    { name: 'Fecha de Registro', selector: (row: Inversionista) => {
      const date = new Date(row.fecha_registro); // Convert to Date object
      const onlyDate = date.toISOString().split('T')[0];
      return onlyDate;
      } 
    },
    { name: 'Saldo', selector: (row: Inversionista) => row.saldo },  
    {
      name: '',
      cell: (row: Inversionista) => (
        <Link href={`/inversionista/${row.id}/editar`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
      ),
    },
  ];

	const filteredItems = inversionistas.filter(
		(c: Inversionista) => c.nombre_completo && c.nombre_completo.toLowerCase().includes(filterText.toLowerCase()) 
	);

    return (
        <div className="mx-20">
          <h1 className="text-xl font-bold m-8">Inversionistas</h1>
          <Link href="/inversionista/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Inversionista</Link>
          
          <DataTable
              title=""
              columns={columns}
              data={filteredItems}
              pagination
              paginationResetDefaultPage={resetPaginationToggle}
              subHeader
              subHeaderComponent={subHeaderComponentMemo}
              persistTableHead
              onRowClicked={(row) => window.location.href = `/inversionista/${row.id}`}
              highlightOnHover
              pointerOnHover
          />
        
        </div>
  );
}