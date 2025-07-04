"use client"

import InversionistaForm from "@/app/components/InversionistaForm";
import { useParams } from "next/navigation";

export default function EditarInversionistaPage() {
  const params = useParams(); 
  const id = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="container mx-auto mt-6">
      <InversionistaForm id={id} />
    </div>
  );
}