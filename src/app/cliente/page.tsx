"use client"

import { useQuery } from "@tanstack/react-query";
import { Cliente } from "../lib/defintions";
import DataTable from "react-data-table-component";
import React from "react";
import { fetchClientes } from "../lib/helpers";
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

  const { data: clientes, isLoading } = useQuery({ queryKey: ["cliente"], queryFn: fetchClientes });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  const columns = [
    { name: 'ID', selector: (row: Cliente) => row.id, width: "80px" },
    { name: 'Nombre Completo', selector: (row: Cliente) => row.nombre_completo, sortable: true, grow: 2},
    { name: 'Nro. de Teléfono', selector: (row: Cliente) => row.nro_telefono },
    { name: 'Dirección', selector: (row: Cliente) => row.direccion, wrap: true, grow: 2},
    { name: 'Email', selector: (row: Cliente) => row.email, grow: 2 },
    { name: 'Ocupación', selector: (row: Cliente) => row.ocupacion, sortable: true },
    { name: 'Domicilio Laboral', selector: (row: Cliente) => row.domicilio_laboral, wrap: true, grow: 2 },
    { name: 'Enlace de Comprobante', selector: (row: Cliente) => row.link_comprobante, grow: 2, wrap: true},  
    {
      name: '',
      cell: (row: Cliente) => (
        <Link href={`/cliente/${row.id}/editar`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
      ),
    },
  ];

	const filteredItems = clientes.filter(
		(c: Cliente) => c.nombre_completo && c.nombre_completo.toLowerCase().includes(filterText.toLowerCase()) ||
        (c.nro_telefono && c.nro_telefono.toLowerCase().includes(filterText.toLowerCase()))
	);

    return (
        <div className="mx-20">
        <h1 className="text-xl font-bold m-8">Clientes</h1>
        <Link href="/cliente/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Cliente</Link>
        
        <DataTable
            title=""
            columns={columns}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            paginationPerPage={15}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
            onRowClicked={(row) => window.location.href = `/cliente/${row.id}`}
            highlightOnHover
            pointerOnHover
        />
        
        </div>
  );
}