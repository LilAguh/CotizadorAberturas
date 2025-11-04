// utils/numeracionPresupuestos.ts

let contadorPresupuestos = 1;

// Función auxiliar para obtener/guardar desde localStorage de forma segura
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

// Generar número de presupuesto incremental (formato: P-202511-0001)
export const generarNumeroPresupuesto = (): string => {
  const guardado = getLocalStorageItem("contadorPresupuestos");
  contadorPresupuestos = guardado ? parseInt(guardado, 10) : contadorPresupuestos;

  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const dia = fecha.getDate().toString().padStart(2, "0");
  const numero = contadorPresupuestos.toString().padStart(4, "0");
  const añoCorto = año.toString().slice(-2)

  contadorPresupuestos++;
  setLocalStorageItem("contadorPresupuestos", contadorPresupuestos.toString());

  return `${dia}${mes}${añoCorto}${numero}`;
};

// Reset manual del contador
export const reiniciarContador = (): void => {
  contadorPresupuestos = 1;
  setLocalStorageItem("contadorPresupuestos", "1");
};
