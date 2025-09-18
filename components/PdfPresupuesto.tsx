"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Ventana = {
  ancho: string;
  alto: string;
  tipoVidrio: string;
  pesoAluminio: string;
  precioAluminio: string;
  precioVidrio: string;
  // 👇 accesorios eliminado porque no queremos mostrarlo
};

type Props = {
  ventanas: Ventana[];
};

export default function PdfPresupuesto({ ventanas }: Props) {
  const generarPDF = () => {
    const doc = new jsPDF();

    // --- Logo (ejemplo con rectángulo) ---
    doc.setFillColor(200, 200, 200);
    doc.rect(10, 10, 40, 20, "F"); // reemplazar con addImage(logo, ...)
    doc.setFontSize(18);
    doc.text("Presupuesto de Ventanas", 105, 20, { align: "center" });

    // --- Datos del local ---
    doc.setFontSize(11);
    doc.text("Carpintería Aluminios S.A.", 14, 40);
    doc.text("CUIT: 30-12345678-9", 14, 46);
    doc.text("Dirección: Av. Ejemplo 123, CABA", 14, 52);
    doc.text("Tel: (011) 4567-8901", 14, 58);

    // --- Tabla ---
    autoTable(doc, {
      startY: 70,
      head: [["Ancho", "Alto", "Vidrio", "Peso Alu (kg)", "Precio Alu", "Precio Vidrio", "Total"]],
      body: ventanas.map((v) => [
        v.ancho,
        v.alto,
        v.tipoVidrio,
        v.pesoAluminio,
        `$${v.precioAluminio}`,
        `$${v.precioVidrio}`,
        `$${(
          Number(v.precioAluminio) +
          Number(v.precioVidrio)
        ).toFixed(2)}`,
      ]),
    });

    // --- Total General ---
    const total = ventanas.reduce(
      (acc, v) =>
        acc +
        Number(v.precioAluminio) +
        Number(v.precioVidrio),
      0
    );

    doc.setFontSize(13);
    doc.text(
      `TOTAL GENERAL: $${total.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );

    // --- Pie ---
    doc.setFontSize(9);
    doc.text(
      "Este presupuesto es válido por 15 días a partir de la fecha de emisión.",
      14,
      280
    );
    doc.text("Los precios incluyen IVA. Condiciones de pago a convenir.", 14, 286);

    doc.save("presupuesto.pdf");
  };

  return (
    <button
      onClick={generarPDF}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Descargar PDF
    </button>
  );
}
