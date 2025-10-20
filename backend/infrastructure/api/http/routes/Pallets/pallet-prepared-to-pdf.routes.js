const express = require("express");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const PgPalletsRepository = require("../../../../database/pg/Pallets/PgPalletsRepository");
const ListOnePalletUseCase = require("../../../../../application/use-cases/Pallets/ListOnePalletUseCase");

function createPalletPreparedPdfRouter({ pool }) {
  const router = express.Router();

  // Composition root
  const palletsRepository = new PgPalletsRepository({ pool });
  const listOnePalletUseCase = new ListOnePalletUseCase({ palletsRepository });

  // POST /api/pallets-db/:id/pdf-prepared
  router.post("/pallets-db/:id/pdf-prepared", async (req, res) => {
    const { id } = req.params;
    const { cantidades } = req.body; // <-- recibimos las cantidades modificadas

    try {
      // Obtener pallet de la base de datos
      const pallet = await listOnePalletUseCase.execute(id);
      if (!pallet) {
        return res.status(404).json({ error: "Pallet no encontrado" });
      }

      // Sustituimos cantidades originales por las enviadas
      if (cantidades && Array.isArray(cantidades)) {
        pallet.lineas.forEach((linea, i) => {
          if (cantidades[i] != null) {
            linea.cantidad = cantidades[i];
          }
        });
      }

      // Generar código QR con la URL correcta
      const url = `http://localhost:5173/pallet/${id}`;
      const qrDataURL = await QRCode.toDataURL(url);

      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });

      // Configurar cabeceras para forzar descarga
      const filename = `pallet_${id}_preparado.pdf`;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
      );

      // Enlazar PDF directamente a la respuesta
      doc.pipe(res);

      // 🧭 Insertar QR en la esquina superior derecha
      const qrSize = 100;
      const pageWidth = doc.page.width;
      const margin = 50;
      const qrX = pageWidth - qrSize - margin;
      const qrY = margin;

      doc.image(qrDataURL, qrX, qrY, { fit: [qrSize, qrSize] });

      // Logo Premium
      doc.image("../frontend/public/logo_premium.png", margin, margin, { fit: [100, 100] });

      // Desplazar el título hacia abajo
      const titleY = margin + 50;
      doc.fontSize(20).text(`Pallet ${pallet.id} - Preparado`, margin, titleY, {
        align: "left",
      });

      // Info pallet
      doc.moveDown(2);
      doc.fontSize(12).text(`Cliente: ${pallet.sellto_customer_name}`);
      doc.fontSize(12).text(`Fecha de carga: ${pallet.furniture_load_date_jmt}`);
      doc.fontSize(12).text(`Evento: ${pallet.jmteventname}`);
      doc.moveDown();

      // Líneas del pallet
      doc.fontSize(14).text("Líneas del pallet:", { underline: true });
      doc.moveDown();

      // Mostrar líneas con cantidades actualizadas
      if (pallet.lineas && Array.isArray(pallet.lineas)) {
        pallet.lineas.forEach((linea, index) => {
          doc.fontSize(12).text(
            `${index + 1}. ${linea.descripcion} — Cantidad: ${linea.cantidad}`
          );
        });
      } else {
        doc.text("No hay líneas asociadas.");
      }

      // Footer
      doc.moveDown();
      doc.fontSize(10).text(`Generado el ${new Date().toLocaleString()}`, {
        align: "right",
      });

      // Finalizar PDF
      doc.end();
    } catch (error) {
      console.error("❌ Error generando PDF del pallet:", error);
      res.status(500).json({ error: "Error generando el PDF del pallet" });
    }
  });

  return router;
}

module.exports = createPalletPreparedPdfRouter;
