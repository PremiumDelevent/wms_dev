const express = require("express");
const PDFDocument = require("pdfkit");
const PgPalletsRepository = require("../../../../database/pg/Pallets/PgPalletsRepository");
const ListOnePalletUseCase = require("../../../../../application/use-cases/Pallets/ListOnePalletUseCase");

function createPalletPdfRouter({ pool }) {
  const router = express.Router();

  // Composition root
  const palletsRepository = new PgPalletsRepository({ pool });
  const listOnePalletUseCase = new ListOnePalletUseCase({ palletsRepository });

  // GET /api/pallets-db/:id/pdf
  router.get("/pallets-db/:id/pdf", async (req, res) => {
    const { id } = req.params;

    try {
      // 1️⃣ Obtener pallet de la base de datos
      const pallet = await listOnePalletUseCase.execute(id);

      if (!pallet) {
        return res.status(404).json({ error: "Pallet no encontrado" });
      }

      // 2️⃣ Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });

      // Configurar cabeceras para forzar descarga
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="pallet_${id}.pdf"`);

      // 3️⃣ Enlazar PDF directamente a la respuesta
      doc.pipe(res);

      // 4️⃣ Contenido del PDF
      doc.fontSize(20).text("📦 Pallet Details", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`ID: ${pallet.id}`);
      doc.text(`Cliente: ${pallet.sellto_customer_name}`);
      doc.text(`Fecha de carga: ${pallet.furniture_load_date_jmt}`);
      doc.text(`Evento: ${pallet.jmteventname}`);
      doc.text(`Estado: ${pallet.jmt_status}`);
      doc.moveDown();

      doc.fontSize(14).text("Líneas del pallet:", { underline: true });
      doc.moveDown();

      // 5️⃣ Mostrar líneas si existen
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

      // 6️⃣ Finalizar PDF
      doc.end();
    } catch (error) {
      console.error("❌ Error generando PDF del pallet:", error);
      res.status(500).json({ error: "Error generando el PDF del pallet" });
    }
  });

  return router;
}

module.exports = createPalletPdfRouter;
