import { Request, Response } from "express";
import prisma from "../../config/db";
import {
  SignerStatus,
  DocumentStatus,
  SignatureType,
} from "@prisma/client";

/**
 * ✅ Accept signer (PUBLIC)
 * POST /api/sign/:token/accept
 */
export const acceptSigner = async (req: Request, res: Response) => {
  let { token } = req.params;
  if (Array.isArray(token)) token = token[0];

  const { type, signatureImage, x, y, page } = req.body;

  try {
    const signer = await prisma.signer.findUnique({
      where: { token },
      include: { document: { include: { signers: true } } },
    });

    if (!signer)
      return res.status(404).json({ message: "Invalid or expired token." });

    if (signer.status !== SignerStatus.PENDING)
      return res.status(400).json({ message: "Signer has already responded." });

    if (!type || !signatureImage || x === undefined || y === undefined || page === undefined) {
      return res.status(400).json({ message: "Signature data missing." });
    }

    const signature = await prisma.signature.create({
      data: {
        documentId: signer.documentId,
        signerId: signer.id,
        type: type as SignatureType,
        value: signatureImage,
        x: Number(x),
        y: Number(y),
        page: Number(page),
      },
    });

    await prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.SIGNED,
        signedAt: new Date(),
      },
    });

    const allSigners = signer.document.signers;
    const signedCount = allSigners.filter(
      (s) => s.id === signer.id || s.status === SignerStatus.SIGNED
    ).length;

    const newDocStatus =
      signedCount === allSigners.length
        ? DocumentStatus.SIGNED
        : DocumentStatus.PARTIALLY_SIGNED;

    await prisma.document.update({
      where: { id: signer.documentId },
      data: { status: newDocStatus },
    });

    // ✅ AUDIT LOG (safe)
    try {
      await prisma.auditLog.create({
        data: {
          documentId: signer.documentId,
          action: "SIGNED",
          ipAddress: req.ip || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
        },
      });
    } catch {}

    return res.status(200).json({
      message: "Signer accepted successfully.",
      signature,
      documentStatus: newDocStatus,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ❌ Reject signer (PUBLIC)
 * POST /api/sign/:token/reject
 */
export const rejectSigner = async (req: Request, res: Response) => {
  let { token } = req.params;
  if (Array.isArray(token)) token = token[0];

  const { reason } = req.body;

  try {
    const signer = await prisma.signer.findUnique({ where: { token } });

    if (!signer)
      return res.status(404).json({ message: "Invalid or expired token." });

    if (signer.status !== SignerStatus.PENDING)
      return res.status(400).json({ message: "Signer has already responded." });

    await prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.REJECTED,
        rejectionReason: reason || "No reason provided",
      },
    });

    await prisma.document.update({
      where: { id: signer.documentId },
      data: { status: DocumentStatus.REJECTED },
    });

    // ✅ AUDIT LOG
    try {
      await prisma.auditLog.create({
        data: {
          documentId: signer.documentId,
          action: "REJECTED",
          ipAddress: req.ip || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
        },
      });
    } catch {}

    return res.status(200).json({ message: "Signer rejected successfully." });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Owner manually accepts signer (AUTH)
 * POST /api/sign/:documentId/signers/:signerId/accept
 */
export const ownerAcceptSigner = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    let { documentId, signerId } = req.params;
    if (Array.isArray(documentId)) documentId = documentId[0];
    if (Array.isArray(signerId)) signerId = signerId[0];

    const signer = await prisma.signer.findUnique({
      where: { id: signerId },
      include: { document: true },
    });

    if (!signer) return res.status(404).json({ message: "Signer not found" });

    if (signer.documentId !== documentId)
      return res.status(400).json({ message: "Signer mismatch" });

    if (signer.document.ownerId !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    if (signer.status !== SignerStatus.PENDING)
      return res.status(400).json({ message: "Signer already responded" });

    const updatedSigner = await prisma.signer.update({
      where: { id: signerId },
      data: { status: SignerStatus.SIGNED, signedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        documentId,
        action: "OWNER_ACCEPTED_SIGNER",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });

    return res.status(200).json({
      message: "Signer accepted successfully",
      signer: updatedSigner,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ❌ Owner manually rejects signer (AUTH)
 * POST /api/sign/:documentId/signers/:signerId/reject
 */
export const ownerRejectSigner = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    let { documentId, signerId } = req.params;
    const { reason } = req.body;

    if (Array.isArray(documentId)) documentId = documentId[0];
    if (Array.isArray(signerId)) signerId = signerId[0];

    const signer = await prisma.signer.findUnique({
      where: { id: signerId },
      include: { document: true },
    });

    if (!signer) return res.status(404).json({ message: "Signer not found" });

    if (signer.document.ownerId !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    await prisma.signer.update({
      where: { id: signerId },
      data: {
        status: SignerStatus.REJECTED,
        rejectionReason: reason || "Rejected by owner",
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.REJECTED },
    });

    await prisma.auditLog.create({
      data: {
        documentId,
        action: "OWNER_REJECTED_SIGNER",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });

    return res.status(200).json({ message: "Signer rejected successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
