"use client"

import ClienteForm from "@/app/components/ClienteForm";
import { useParams } from "next/navigation";

export default function EditarClientePage() {
  const params = useParams(); 
  const id = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="container mx-auto mt-6">
      <ClienteForm id={id} />
    </div>
  );
}