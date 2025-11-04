// utils/codigosVentana.ts
export const generarCodigoVentana = (): string => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 7; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

export const generarCodigoDesdeTipo = (tipo: 'corrediza2hojas' | 'pañoFijo' | 'mosquitero'): string => {
  return generarCodigoVentana();
};