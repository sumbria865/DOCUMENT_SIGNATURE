import prisma from "../../config/db";
import { embedSignatureOnPdf } from "../../services/pdf.service";

export const verifySignerToken = async (token: string) => {
  const signer = await prisma.signer.findUnique({
    where: { token },
    include: { document: true }
  });

  if (!signer) throw new Error("Invalid or expired signing link");

  if (signer.status === "SIGNED") {
    throw new Error("Document already signed");
  }

  return {
    signerId: signer.id,
    email: signer.email,
    documentId: signer.documentId,
    pdfUrl: signer.document.originalUrl
  };
};

export const completeSigning = async (data: any, req: any) => {
  const { token, type, signatureImage, x, y, page } = data;

  // 🔐 1. Validate payload
  if (!token || !type || !signatureImage) {
    throw new Error("Invalid signing payload");
  }

  const signer = await prisma.signer.findUnique({
    where: { token },
    include: { document: true }
  });

  if (!signer) throw new Error("Invalid or expired token");

  if (signer.status === "SIGNED") {
    throw new Error("Document already signed");
  }

  // ✍️ 2. Create signature record
  const signature = await prisma.signature.create({
    data: {
      documentId: signer.documentId,
      signerId: signer.id,
      type,
      value: signatureImage,
      x: Number(x),
      y: Number(y),
      page: Number(page)
    }
  });

  // 📄 3. Embed signature in PDF
  const signedPdfUrl = await embedSignatureOnPdf({
    document: signer.document,
    signature
  });

  // 👤 4. Update signer status
  await prisma.signer.update({
    where: { id: signer.id },
    data: {
      status: "SIGNED",
      signedAt: new Date()
    }
  });

  // 📊 5. Check remaining signers
  const pendingSigners = await prisma.signer.count({
    where: {
      documentId: signer.documentId,
      status: "PENDING"
    }
  });

  // 📘 6. Update document
  await prisma.document.update({
    where: { id: signer.documentId },
    data: {
      signedUrl: signedPdfUrl,
      status: pendingSigners === 0 ? "SIGNED" : "PARTIALLY_SIGNED"
    }
  });

  // 🧾 7. Audit log (safe)
  await prisma.auditLog.create({
    data: {
      documentId: signer.documentId,
      action: `SIGNER_SIGNED (${signer.email})`,
      ipAddress: req.ip || "UNKNOWN",
      userAgent: req.headers["user-agent"] || "UNKNOWN",
    }
  });

  return { success: true };
};