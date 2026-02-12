import React, { useMemo, useState } from "react";
import { VentanaPresupuestada } from "@/hooks/usePresupuesto";

interface Props {
  ventanas: VentanaPresupuestada[];
  onEliminarVentana: (id: string) => void;
  total: number;
}

export const ListaPresupuesto: React.FC<Props> = ({
  ventanas,
  onEliminarVentana,
  total,
}) => {
  // -----------------------------
  // AGRUPAR ÍTEMS
  // -----------------------------
  const grupos = useMemo(() => {
    const map = new Map<
      string,
      {
        ids: string[];
        tipoNombre: string;
        descripcion: string;
        medidas: string;
        precioUnitario: number;
        cantidad: number;
        esManual: boolean;
      }
    >();

    ventanas.forEach((v) => {
      // 🔴 MANUALES: NO SE AGRUPAN
      if (v.tipo === "manual") {
        map.set(v.id, {
          ids: [v.id],
          tipoNombre: v.tipoNombre,
          descripcion: v.descripcion ?? "",
          medidas: "",
          precioUnitario: v.precio / (v.cantidad ?? 1),
          cantidad: v.cantidad ?? 1,
          esManual: true,
        });
        return;
      }

      // 🪟 RESTO: SE AGRUPAN
      const key = `${v.tipo}|${v.tipoNombre}|${v.medidas}|${v.precio}`;

      if (!map.has(key)) {
        map.set(key, {
          ids: [v.id],
          tipoNombre: v.tipoNombre,
          descripcion: v.descripcion ?? "",
          medidas: v.medidas ?? "",
          precioUnitario: v.precio,
          cantidad: 1,
          esManual: false,
        });
      } else {
        const g = map.get(key)!;
        g.cantidad += 1;
        g.ids.push(v.id);
      }
    });

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [ventanas]);

  // -----------------------------
  // EXPANDIR / COLAPSAR
  // -----------------------------
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (k: string) =>
    setExpanded((prev) => ({ ...prev, [k]: !prev[k] }));

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-3">Presupuesto Actual</h2>

      {ventanas.length === 0 ? (
        <p className="text-gray-500">No hay artículos en el presupuesto</p>
      ) : (
        <div className="space-y-4">
          {grupos.map((g) => {
            const subtotal = g.precioUnitario * g.cantidad;

            return (
              <div key={g.key} className="border-b pb-3">
                <div className="flex justify-between items-start gap-4">
                  {/* DESCRIPCIÓN */}
                  <div>
                    <h3 className="font-semibold text-base">
                      {g.tipoNombre}
                    </h3>

                    {g.descripcion && (
                      <p className="text-sm text-gray-600">
                        {g.descripcion}
                      </p>
                    )}

                    {g.medidas && !g.esManual && (
                      <p className="text-xs text-gray-500">
                        Medidas: {g.medidas}
                      </p>
                    )}
                  </div>

                  {/* PRECIOS */}
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      ${subtotal.toLocaleString()}
                    </div>

                    {g.cantidad > 1 && (
                      <div className="text-sm text-gray-600">
                        {g.cantidad} × ${g.precioUnitario.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEliminarVentana(g.ids[g.ids.length - 1])}
                  >
                    Eliminar
                  </button>

                  {!g.esManual && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        g.ids.forEach((id) => onEliminarVentana(id))
                      }
                    >
                      Eliminar todo
                    </button>
                  )}

                  <button
                    className="btn btn-link btn-sm"
                    onClick={() => toggle(g.key)}
                  >
                    {expanded[g.key]
                      ? "Ocultar IDs"
                      : `Ver IDs (${g.ids.length})`}
                  </button>
                </div>

                {/* IDS */}
                {expanded[g.key] && (
                  <div className="mt-2 text-xs text-gray-700">
                    <strong>IDs:</strong>
                    <ul className="mt-1 list-disc ml-5">
                      {g.ids.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* TOTAL */}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>TOTAL:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
