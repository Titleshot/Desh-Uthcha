/**
 * Merges documents/nepali-source/01.png … 19.png into documents/official-source-nepali.pdf
 * Run: npm run build:pdf   (from project root)
 */
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function main() {
  const root = path.join(__dirname, "..");
  const srcDir = path.join(root, "documents", "nepali-source");
  const outPath = path.join(root, "documents", "official-source-nepali.pdf");
  const pdfDoc = await PDFDocument.create();

  for (let i = 1; i <= 19; i++) {
    const file = path.join(srcDir, `${String(i).padStart(2, "0")}.png`);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing: ${file}`);
    }
    const pngBytes = fs.readFileSync(file);
    const image = await pdfDoc.embedPng(pngBytes);
    const w = image.width;
    const h = image.height;
    const page = pdfDoc.addPage([w, h]);
    page.drawImage(image, { x: 0, y: 0, width: w, height: h });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
  console.log("Wrote", outPath, `(${pdfBytes.length} bytes)`);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
