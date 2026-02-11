import { Request, Response } from "express";
import prisma from "../../config/db";

import {
  SignerStatus,
  DocumentStatus,
  SignatureType,
} from "@prisma/client";

/**
 * ✅ Accept a signer for a document using token (EXTERNAL SIGNER - PUBLIC)
 * Route: POST /api/sign/:token/accept
 */
export const acceptSigner = async (req: Request, res: Response) => {
  let { token } = req.params;

  if (Array.isArray(token)) token = token[0];

  // ✅ IMPORTANT FIX: frontend sends signatureImage not value
  const { type, signatureImage, x, y, page } = req.body;

  console.log("=== EXTERNAL SIGNER ACCEPT ===");
  console.log("Token:", token);
  console.log("Request body:", { type, signatureImage, x, y, page });

  try {
    const signer = await prisma.signer.findUnique({
      where: { token },
      include: { document: { include: { signers: true } } },
    });

    if (!signer) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    if (signer.status !== SignerStatus.PENDING) {
      return res.status(400).json({ message: "Signer has already responded." });
    }

    // ✅ Validate signature data
    if (
      !type ||
      !signatureImage ||
      x === undefined ||
      y === undefined ||
      page === undefined
    ) {
      return res.status(400).json({
        message:
          "Signature data missing. Required: type, signatureImage, x, y, page",
      });
    }

    // ✅ Create signature
    const signature = await prisma.signature.create({
      data: {
        documentId: signer.documentId,
        signerId: signer.id,
        type: type as SignatureType,
        value: signatureImage, // ✅ stored in DB
        x: Number(x),
        y: Number(y),
        page: Number(page),
      },
    });

    console.log("✅ Signature created:", signature.id);

    // ✅ Update signer status
    await prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.SIGNED,
        signedAt: new Date(),
      },
    });

    console.log("✅ Signer updated to SIGNED");

    // ✅ Update document status
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

    console.log("✅ Document status updated:", newDocStatus);

    return res.status(200).json({
      message: "Signer accepted successfully.",
      signature,
      documentStatus: newDocStatus,
    });
  } catch (error: any) {
    console.error("❌ Error in acceptSigner:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};

/**
 * ❌ Reject a signer for a document using token (EXTERNAL SIGNER - PUBLIC)
 * Route: POST /api/sign/:token/reject
 */
export const rejectSigner = async (req: Request, res: Response) => {
  let { token } = req.params;

  if (Array.isArray(token)) token = token[0];

  const { reason } = req.body;

  try {
    const signer = await prisma.signer.findUnique({
      where: { token },
      include: { document: { include: { signers: true } } },
    });

    if (!signer) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    if (signer.status !== SignerStatus.PENDING) {
      return res.status(400).json({ message: "Signer has already responded." });
    }

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

    return res.status(200).json({ message: "Signer rejected successfully." });
  } catch (error: any) {
    console.error("❌ Error in rejectSigner:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};

/**
 * ✅ Owner manually accepts a signer (AUTH REQUIRED)
 * Route: POST /api/sign/:documentId/signers/:signerId/accept
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

    if (!signer) {
      return res.status(404).json({ message: "Signer not found" });
    }

    if (signer.documentId !== documentId) {
      return res
        .status(400)
        .json({ message: "Signer does not belong to this document" });
    }

    if (signer.document.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (signer.status !== SignerStatus.PENDING) {
      return res.status(400).json({
        message: `Signer status is already ${signer.status}`,
      });
    }

    const updatedSigner = await prisma.signer.update({
      where: { id: signerId },
      data: {
        status: SignerStatus.SIGNED,
        signedAt: new Date(),
      },
    });

    const allSigners = await prisma.signer.findMany({
      where: { documentId },
    });

    const allSigned = allSigners.every(
      (s) => s.status === SignerStatus.SIGNED
    );
    const anySigned = allSigners.some(
      (s) => s.status === SignerStatus.SIGNED
    );

    let newDocStatus: DocumentStatus = DocumentStatus.PENDING;

    if (allSigned) newDocStatus = DocumentStatus.SIGNED;
    else if (anySigned) newDocStatus = DocumentStatus.PARTIALLY_SIGNED;

    await prisma.document.update({
      where: { id: documentId },
      data: { status: newDocStatus },
    });

    return res.status(200).json({
      message: "Signer accepted successfully",
      signer: updatedSigner,
      documentStatus: newDocStatus,
    });
  } catch (error: any) {
    console.error("❌ Error in ownerAcceptSigner:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * ❌ Owner manually rejects a signer (AUTH REQUIRED)
 * Route: POST /api/sign/:documentId/signers/:signerId/reject
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

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        message: "Rejection reason is required (min 3 characters)",
      });
    }

    const signer = await prisma.signer.findUnique({
      where: { id: signerId },
      include: { document: true },
    });

    if (!signer) {
      return res.status(404).json({ message: "Signer not found" });
    }

    if (signer.documentId !== documentId) {
      return res
        .status(400)
        .json({ message: "Signer does not belong to this document" });
    }

    if (signer.document.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (signer.status !== SignerStatus.PENDING) {
      return res.status(400).json({
        message: `Signer status is already ${signer.status}`,
      });
    }

    const updatedSigner = await prisma.signer.update({
      where: { id: signerId },
      data: {
        status: SignerStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.REJECTED },
    });

    return res.status(200).json({
      message: "Signer rejected successfully",
      signer: updatedSigner,
      documentStatus: DocumentStatus.REJECTED,
    });
  } catch (error: any) {
    console.error("❌ Error in ownerRejectSigner:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};
