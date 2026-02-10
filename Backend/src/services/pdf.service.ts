import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export const embedSignatureOnPdf = async ({
  document,
  signature
}: any): Promise<string> => {

  const pdfPath = path.join("uploads", `${document.id}.pdf`);
  const pdfBytes = fs.readFileSync(pdfPath);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[signature.page - 1];

  let image;
  if (signature.type === "IMAGE") {
    image = await pdfDoc.embedPng(signature.value);
  } else {
    image = await pdfDoc.embedPng(signature.value);
  }

  page.drawImage(image, {
    x: signature.x,
    y: signature.y,
    width: 150,
    height: 60
  });

  const signedPdf = await pdfDoc.save();
  const signedPath = path.join("uploads", `${document.id}-signed.pdf`);
  fs.writeFileSync(signedPath, signedPdf);

  return `/uploads/${document.id}-signed.pdf`;
};
