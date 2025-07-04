"use client"

import AvalForm from "@/app/components/AvalForm";
import { useParams } from "next/navigation";

export default function EditarAvalPage() {
  const params = useParams(); 
  const id = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="container mx-auto mt-6">
      <AvalForm id={id} />
    </div>
  );
}