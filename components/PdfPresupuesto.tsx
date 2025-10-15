// components/PdfPresupuesto.tsx
"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type VentanaAcumulada = {
  acabado: any;
  id: string;
  tipo: string;
  tipoNombre: string;
  ancho: number;
  alto: number;
  medidas: string;
  precioConIVA: number;
  detalles: any;
  timestamp: number;
};

type Props = {
  ventanas: VentanaAcumulada[];
};

export default function PdfPresupuesto({ ventanas }: Props) {
  const generarPDF = () => {
    if (ventanas.length === 0) {
      alert("No hay ventanas en el presupuesto para generar PDF");
      return;
    }

    const doc = new jsPDF();

    // --- Logo y Título ---
    doc.setFillColor(200, 200, 200);
    doc.rect(10, 10, 40, 20, "F");
    doc.setFontSize(18);
    doc.text("PRESUPUESTO DE ABERTURAS", 105, 20, { align: "center" });

    // --- Datos del Local ---
    doc.setFontSize(11);
    doc.text("Carpintería Aluminios S.A.", 14, 40);
    doc.text("CUIT: 30-12345678-9", 14, 46);
    doc.text("Dirección: Av. Ejemplo 123, CABA", 14, 52);
    doc.text("Tel: (011) 4567-8901", 14, 58);

    // --- Tabla de Ventanas ---
    autoTable(doc, {
  startY: 70,
  head: [["Tipo", "Medidas", "Acabado", "Vidrio", "Peso Alu (kg)", "Precio Alu", "Precio Vidrio", "Total"]],
  body: ventanas.map((v) => {
    const detalles = v.detalles;
    const tipoVidrio = detalles.vidrios.esDvh 
      ? `DVH: ${detalles.vidrios.vidrioExterior?.nombre} + ${detalles.vidrios.vidrioInterior?.nombre}`
      : detalles.vidrios.vidrioExterior?.nombre;
    
    return [
      v.tipoNombre,
      v.medidas,
      v.acabado.color, // Nueva columna
      tipoVidrio,
      detalles.pesoTotalAluminio.toFixed(2),
      `$${detalles.precios.precioVentaAluminio.toFixed(2)}`,
      `$${detalles.precios.precioVentaVidrio.toFixed(2)}`,
      `$${v.precioConIVA.toFixed(2)}`
    ];
  }),
});

    // --- Total General ---
    const total = ventanas.reduce((acc, v) => acc + v.precioConIVA, 0);

    doc.setFontSize(13);
    doc.text(
      `TOTAL GENERAL: $${total.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );

    // --- Pie de Página ---
    doc.setFontSize(9);
    const fecha = new Date().toLocaleDateString('es-AR');
    doc.text(`Fecha de emisión: ${fecha}`, 14, 280);
    doc.text("Este presupuesto es válido por 15 días a partir de la fecha de emisión.", 14, 286);
    doc.text("Los precios incluyen IVA. Condiciones de pago a convenir.", 14, 292);

    doc.save(`presupuesto-${fecha.replace(/\//g, '-')}.pdf`);
  };

  return (
    <button
    onClick={generarPDF}
    className="btn btn-primary w-full"
  >
      📄 Descargar Presupuesto PDF
    </button>
  );
}