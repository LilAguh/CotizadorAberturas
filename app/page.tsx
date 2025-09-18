'use client'

import Cotizador from "@/components/Cotizador";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cotizador de Aberturas</h1>
      <Cotizador />
    </main>
  );
}
