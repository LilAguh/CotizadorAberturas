import React from 'react';

export type TipoVentana = 'corrediza' | 'fija' | 'batiente';

interface Props {
  tipoSeleccionado: TipoVentana;
  onTipoChange: (tipo: TipoVentana) => void;
}

export const SelectorTipoVentana: React.FC<Props> = ({
  tipoSeleccionado,
  onTipoChange
}) => {
  const tipos: { id: TipoVentana; nombre: string; icono: string }[] = [
    { id: 'corrediza', nombre: 'Corrediza', icono: '↔️' },
    { id: 'fija', nombre: 'Paño Fijo', icono: '🪟' },
    { id: 'batiente', nombre: 'Batiente', icono: '🪟' }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Seleccionar Tipo de Ventana</h2>
      <div className="grid grid-cols-3 gap-4">
        {tipos.map((tipo) => (
          <button
            key={tipo.id}
            onClick={() => onTipoChange(tipo.id)}
            className={`p-4 border-2 rounded-lg transition-all ${
              tipoSeleccionado === tipo.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <div className="text-2xl mb-2">{tipo.icono}</div>
            <div className="font-semibold">{tipo.nombre}</div>
          </button>
        ))}
      </div>
    </div>
  );
};