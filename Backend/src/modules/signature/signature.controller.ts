// src/modules/signature/signature.controller.ts
import { Request, Response } from "express";
import { PrismaClient, SignerStatus, DocumentStatus, SignatureType } from "@prisma/client";

import prisma from "../../config/db";

/**
 * Optional: verify token
 */
export const verifySignerToken = async (req: Request, res: Response) => {
  const token = req.params.token as string;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const signer = await prisma.signer.findUnique({
      where: { token },
      include: { document: true },
    });

    if (!signer) {
      return res.status(404).json({ message: "Invalid token" });
    }

    return res.json({ valid: true, token, signer });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Accept a signer for a document using token
 */
export const acceptSigner = async (req: Request, res: Response) => {
  console.log("✅ acceptSigner called!");
  console.log("Token:", req.params.token);
  console.log("Body:", req.body);

  const token = req.params.token as string;
  const { type, value, x, y, page } = req.body;

  try {
    // 1️⃣ Find the signer by token
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

    // 2️⃣ Create the signature
    const signature = await prisma.signature.create({
      data: {
        documentId: signer.documentId,
        signerId: signer.id,
        type: type as SignatureType,
        value,
        x,
        y,
        page,
      },
    });

    // 3️⃣ Update signer status to SIGNED
    await prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.SIGNED,
        signedAt: new Date(),
        signature: { connect: { id: signature.id } },
      },
    });

    // 4️⃣ Update document status
    const allSigners = signer.document.signers;
    const signedCount = allSigners.filter((s) =>
      s.id === signer.id || s.status === SignerStatus.SIGNED
    ).length;

    const newDocumentStatus =
      signedCount === allSigners.length
        ? DocumentStatus.SIGNED
        : DocumentStatus.PARTIALLY_SIGNED;

    await prisma.document.update({
      where: { id: signer.documentId },
      data: { status: newDocumentStatus },
    });

    return res.status(200).json({
      message: "Signer accepted.",
      signature,
      documentStatus: newDocumentStatus,
    });
  } catch (error) {
    console.error("❌ Error in acceptSigner:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Reject a signer for a document using token
 */
export const rejectSigner = async (req: Request, res: Response) => {
  const token = req.params.token as string;
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

    // Update signer status to REJECTED
    await prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.REJECTED,
        rejectionReason: reason || "No reason provided",
      },
    });

    // Update document status to REJECTED
    await prisma.document.update({
      where: { id: signer.documentId },
      data: { status: DocumentStatus.REJECTED },
    });

    return res.status(200).json({ message: "Signer rejected." });
  } catch (error) {
    console.error("Error in rejectSigner:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};