"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    titulo: string;
    descripcion: string;
    precio: number;
  }) => void;
}

export function ModalArticuloManual({ open, onClose, onConfirm }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");

  const handleConfirm = () => {
    const precioNum = parseFloat(precio);
    if (!titulo || isNaN(precioNum)) return;

    onConfirm({
      titulo,
      descripcion,
      precio: precioNum,
    });

    setTitulo("");
    setDescripcion("");
    setPrecio("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop: ocupa toda la pantalla y tiene fondo semitransparente */}
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      {/* Contenedor full-screen que centra el panel */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
          <DialogTitle className="text-lg font-bold">
            Artículo manual
          </DialogTitle>

          <Description className="text-sm text-gray-600">
            Agregar un ítem manual al presupuesto
          </Description>

          <div className="space-y-3">
            <input
              className="input w-full"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />

            <input
              className="input w-full"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <input
              className="input w-full"
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button onClick={handleConfirm} className="btn btn-primary">
              Agregar
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}