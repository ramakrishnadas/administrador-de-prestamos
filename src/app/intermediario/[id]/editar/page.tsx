"use client"

import IntermediarioForm from "@/app/components/IntermediarioForm";
import { useParams } from "next/navigation";

export default function EditarIntermediarioPage() {
  const params = useParams(); 
  const id = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="container mx-auto mt-6">
      <IntermediarioForm id={id} />
    </div>
  );
}