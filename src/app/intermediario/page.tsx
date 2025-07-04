"use client"

import { useQuery } from "@tanstack/react-query";
import { Intermediario } from "../lib/defintions";
import DataTable from "react-data-table-component";
import React from "react";
import { fetchIntermediarios } from "../lib/helpers";
import Link from "next/link";
import FilterComponent from "../components/FilterComponent";

export default function IntermediariosPage() {
  
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

  const { data: intermediarios, isLoading } = useQuery({ queryKey: ["cliente"], queryFn: fetchIntermediarios });

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  const columns = [
    { name: 'ID', selector: (row: Intermediario) => row.id, width: "80px" },
    { name: 'Nombre Completo', selector: (row: Intermediario) => row.nombre_completo, sortable: true, grow: 2},
    { name: 'Nro. de Teléfono', selector: (row: Intermediario) => row.nro_telefono },
    { name: 'Email', selector: (row: Intermediario) => row.email, grow: 2 },
    {
      name: '',
      cell: (row: Intermediario) => (
        <Link href={`/intermediario/${row.id}/editar`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
      ),
    },
  ];

	const filteredItems = intermediarios.filter(
		(c: Intermediario) => c.nombre_completo && c.nombre_completo.toLowerCase().includes(filterText.toLowerCase()) ||
        (c.nro_telefono && c.nro_telefono.toLowerCase().includes(filterText.toLowerCase()))
	);

    return (
        <div className="mx-20">
        <h1 className="text-xl font-bold m-8">Intermediarios</h1>
        <Link href="/intermediario/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Intermediario</Link>
        
        <DataTable
            title=""
            columns={columns}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
            onRowClicked={(row) => window.location.href = `/intermediario/${row.id}`}
            highlightOnHover
            pointerOnHover
        />
        
        </div>
  );
}