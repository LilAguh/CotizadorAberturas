// components/ListaPresupuesto.tsx
import React, { useMemo, useState } from "react";
import { VentanaPresupuestada } from "@/hooks/usePresupuesto";

interface Props {
  ventanas: VentanaPresupuestada[];
  onEliminarVentana: (id: string) => void;
  total: number;
}

export const ListaPresupuesto: React.FC<Props> = ({ ventanas, onEliminarVentana, total }) => {
  // Agrupar ventanas iguales por una clave: tipo + medidas + acabado + vidrio(s) + esDvh + incluirMosquitero
  const grupos = useMemo(() => {
    const map = new Map<string, {
      ids: string[];
      tipo: string;
      tipoNombre: string;
      medidas: string;
      descripcion: string;
      precioUnitario: number;
      acabadoColor?: string;
      cantidad: number;
    }>();

    ventanas.forEach(v => {
      const vidrioExteriorId = v.detalles?.vidrios?.vidrioExterior?.id ?? "ne";
      const vidrioInteriorId = v.detalles?.vidrios?.vidrioInterior?.id ?? "ni";
      const esDvh = v.detalles?.vidrios?.esDvh ? "dvh" : "s";
      const key = `${v.tipo}|${v.medidas}|${v.acabado.color}|${vidrioExteriorId}|${vidrioInteriorId}|${esDvh}|${v.incluirMosquitero ? 'm' : 'n'}`;

      if (!map.has(key)) {
        map.set(key, {
          ids: [v.id],
          tipo: v.tipo,
          tipoNombre: v.tipoNombre,
          medidas: v.medidas,
          descripcion: v.descripcion,
          precioUnitario: v.precioConIVA || v.precio || 0,
          acabadoColor: v.acabado?.color,
          cantidad: 1
        });
      } else {
        const g = map.get(key)!;
        g.ids.push(v.id);
        g.cantidad += 1;
        // precio unitario asumimos constante entre iguales
      }
    });

    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
  }, [ventanas]);

  // Expandir grupo para ver códigos
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setExpanded(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-3">Presupuesto Actual</h2>

      {ventanas.length === 0 ? (
        <p className="text-gray-500">No hay ventanas en el presupuesto</p>
      ) : (
        <div className="space-y-3">
          {grupos.map(g => {
            const subtotal = g.precioUnitario * g.cantidad;
            return (
              <div key={g.key} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{g.tipoNombre} <span className="text-sm text-gray-600">({g.medidas})</span></h3>
                    <p className="text-sm text-gray-600">Acabado: {g.acabadoColor}</p>
                    <p className="text-sm text-gray-600">Descripción: {g.descripcion}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">${g.precioUnitario.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">x {g.cantidad} = ${subtotal.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      // eliminar 1 unidad: usamos el último id del grupo
                      const id = g.ids[g.ids.length - 1];
                      if (id) onEliminarVentana(id);
                    }}
                  >
                    Eliminar 1 unidad
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      // eliminar todo: llamar onEliminarVentana para cada id
                      g.ids.slice().forEach(id => onEliminarVentana(id));
                    }}
                  >
                    Eliminar todo
                  </button>

                  <button className="btn btn-link btn-sm" onClick={() => toggle(g.key)}>
                    {expanded[g.key] ? 'Ocultar códigos' : `Ver códigos (${g.ids.length})`}
                  </button>
                </div>

                {expanded[g.key] && (
                  <div className="mt-2 text-xs text-gray-700">
                    <strong>Códigos:</strong>
                    <ul className="mt-1 list-disc ml-5">
                      {g.ids.map(id => (
                        <li key={id} className="flex justify-between items-center">
                          <span>{id}</span>
                          <button className="text-red-500 text-xs" onClick={() => onEliminarVentana(id)}>Eliminar</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

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
