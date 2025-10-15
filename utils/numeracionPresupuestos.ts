// utils/numeracionPresupuestos.ts
let contadorPresupuestos = 1;

export const generarNumeroPresupuesto = (): string => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const numero = contadorPresupuestos.toString().padStart(4, '0');
  
  contadorPresupuestos++;
  
  return `P-${año}${mes}-${numero}`;
};

export const reiniciarContador = () => {
  contadorPresupuestos = 1;
};