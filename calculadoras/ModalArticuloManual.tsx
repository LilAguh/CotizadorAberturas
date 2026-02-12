"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    titulo: string;
    descripcion: string;
    precio: number;
    cantidad: number;
  }) => void;
}

export function ModalArticuloManual({ open, onClose, onConfirm }: Props) {
  const [mounted, setMounted] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  const handleConfirm = () => {
    const precioNum = parseFloat(precio);
    const cantidadNum = parseInt(cantidad, 10);

    if (!titulo || isNaN(precioNum) || isNaN(cantidadNum) || cantidadNum < 1) {
      return;
    }

    onConfirm({
      titulo,
      descripcion,
      precio: precioNum,
      cantidad: cantidadNum,
    });

    setTitulo("");
    setDescripcion("");
    setPrecio("");
    setCantidad("");
    onClose();
  };

  if (!mounted || !open) return null;

  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <>
      {/* Overlay oscuro */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.75)",
          zIndex: 9998,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor centrado */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {/* Panel del modal - invertido (oscuro) */}
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            pointerEvents: "auto",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h2
            id="modal-title"
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#fff",
            }}
          >
            Artículo manual
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#ccc",
              marginBottom: "1.5rem",
            }}
          >
            Agregar un ítem manual al presupuesto
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <input
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #444",
                borderRadius: "0.5rem",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "0.875rem",
              }}
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              autoFocus
            />
            <input
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #444",
                borderRadius: "0.5rem",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "0.875rem",
              }}
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <input
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #444",
                borderRadius: "0.5rem",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "0.875rem",
              }}
              type="number"
              placeholder="Precio unitario"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                  color: "#ccc",
                }}
              >
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #444",
                  borderRadius: "0.5rem",
                  backgroundColor: "#333",
                  color: "#fff",
                  fontSize: "0.875rem",
                }}
                placeholder="Ingresá la cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                fontWeight: "600",
                borderRadius: "0.5rem",
                border: "1px solid #444",
                backgroundColor: "transparent",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: "0.75rem 1.5rem",
                fontWeight: "600",
                borderRadius: "0.5rem",
                border: "1px solid transparent",
                backgroundColor: "#fff",
                color: "#000",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </>,
    modalRoot
  );
}