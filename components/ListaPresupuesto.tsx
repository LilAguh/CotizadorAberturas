// components/ListaPresupuesto.tsx
import React from 'react';
import { VentanaPresupuestada } from '@/hooks/usePresupuesto';

interface Props {
  ventanas: VentanaPresupuestada[];
  onEliminarVentana: (id: string) => void;
  total: number;
}

export const ListaPresupuesto: React.FC<Props> = ({
  ventanas,
  onEliminarVentana,
  total
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Presupuesto Actual</h2>
      
      {ventanas.length === 0 ? (
        <p className="text-gray-500">No hay ventanas en el presupuesto</p>
      ) : (
        <div className="space-y-3">
          {ventanas.map((ventana) => (
            <div key={ventana.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-semibold">{ventana.descripcion}</h3>
                <p className="text-sm text-gray-600">{ventana.medidas}</p>
                <p className="text-xs text-gray-500">Código: {ventana.codigo}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">${ventana.precioConIVA.toLocaleString()}</span>
                <button
                  onClick={() => onEliminarVentana(ventana.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};