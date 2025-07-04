"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Aval } from "../lib/defintions";
import DataTable, { ExpanderComponentProps } from "react-data-table-component";
import React from "react";
import { fetchAvales } from "../lib/helpers";
import Link from "next/link";
import FilterComponent from "../components/FilterComponent";

const ExpandedComponent: React.FC<ExpanderComponentProps<Aval>> = ({ data }) => {
  const [success, setSuccess] = React.useState<string | null>(null); // Success state
  const [showModal, setShowModal] = React.useState(false);

  const queryClient = useQueryClient();

  async function deleteAval() {
    try {
      const res = await fetch(`/api/aval/${data.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar aval");

      setSuccess("Aval eliminado exitosamente."); // Set success message
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["aval"] }), 1500); // Delay redirect to show message
    } catch (error) {
      console.error(error);
    }
  }
	return (
    <>
      <div className="flex p-5 border-1 border-gray-400 space-x-4 justify-evenly items-center">
        <p><span className="font-bold">Domicilio:</span> {data.domicilio}</p>
        <p><span className="font-bold">Domicilio Laboral:</span> {data.domicilio_laboral}</p>
        <Link href={`/aval/${data.id}/editar`} className="text-blue-500 ml-2 hover:bg-gray-200 p-2 rounded-sm">
          Editar
        </Link>
        <button
          className="bg-red-500 text-white p-2 rounded hover:bg-red-700 focus:outline-none cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Eliminar
        </button>
      </div>

      {/* Custom Modal */}
      {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              {success ? (
                  <p className="text-green-600 text-center font-medium">{success}</p>
                ) : (
                  <>
                    <p className="mb-4 text-lg font-medium text-gray-800 text-center">
                      ¿Estás seguro de que deseas eliminar este aval?
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                        onClick={deleteAval}
                      >
                        Sí, eliminar
                      </button>
                      <button
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowModal(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
            </div>
          </div>
        )}
    </>
  );
};

export default function AvalesPage() {
  const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState<Aval | null>(null);

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

  const { data: avales, isLoading } = useQuery({ queryKey: ["aval"], queryFn: fetchAvales });

  if (isLoading) 
    return (
      <div className="flex items-center justify-center h-screen">
          <p className="text-lg font-medium">Cargando...</p>
      </div>
    );

  const columns = [
    { name: 'ID', selector: (row: Aval) => row.id, width: "80px" },
    { name: 'Nombre Completo', selector: (row: Aval) => row.nombre_completo, sortable: true, grow: 2},
    { name: 'Nro. de Teléfono', selector: (row: Aval) => row.nro_telefono },
    { name: 'Ocupación', selector: (row: Aval) => row.ocupacion, sortable: true },
    { name: 'Enlace de Comprobante', selector: (row: Aval) => row.link_comprobante, grow: 2, wrap: true},
  ];

	const filteredItems = avales.filter(
		(c: Aval) => c.nombre_completo && c.nombre_completo.toLowerCase().includes(filterText.toLowerCase()) ||
        (c.nro_telefono && c.nro_telefono.toLowerCase().includes(filterText.toLowerCase()))
	);

  return (
      <div className="mx-20">
        <h1 className="text-xl font-bold m-8">Avales</h1>
        <Link href="/aval/nuevo" className="text-white mx-8 my-10 bg-slate-700 hover:bg-gray-200 hover:text-slate-700 p-[15px] rounded-sm">Registrar Aval</Link>
        
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
            expandableRows 
            expandableRowExpanded={(row) => (row === currentRow)}
            expandableRowsComponent={ExpandedComponent}
            onRowExpandToggled={(bool, row) => setCurrentRow(row)}
            expandOnRowClicked
        />
        
      
      </div>
  );
}