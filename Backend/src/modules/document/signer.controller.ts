import { Request, Response } from "express";
import { PrismaClient, SignerStatus, DocumentStatus, SignatureType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Accept a signer for a document using token (EXISTING - for external signers)
 */

export const acceptSigner = async (req: Request, res: Response) => {
  let { token } = req.params;
  
  // ✅ Fix TypeScript: token could be string | string[]
  if (Array.isArray(token)) {
    token = token[0];
  }

  const { type, value, x, y, page } = req.body;

  // ✅ ADD DEBUG LOGGING
  console.log("=== EXTERNAL SIGNER ACCEPT ===");
  console.log("Token:", token);
  console.log("Request body:", { type, value: value?.substring(0, 50) + "...", x, y, page });

  try {
    console.log("Looking for signer with token...");
    const signer = await prisma.signer.findUnique({
      where: { token },
      include: { document: { include: { signers: true } } },
    });

    console.log("Signer found:", signer ? "YES" : "NO");

    if (!signer) {
      console.log("❌ Token not found in database");
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    console.log("Signer email:", signer.email);
    console.log("Signer status:", signer.status);

    if (signer.status !== SignerStatus.PENDING) {
      console.log("❌ Signer already responded");
      return res.status(400).json({ message: "Signer has already responded." });
    }

    console.log("Creating signature...");
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

    console.log("✅ Signature created:", signature.id);

    console.log("Updating signer status...");
    await prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.SIGNED,
        signedAt: new Date(),
        signature: { connect: { id: signature.id } },
      },
    });

    console.log("✅ Signer updated to SIGNED");

    const allSigners = signer.document.signers;
    const signedCount = allSigners.filter((s: any) =>
      s.id === signer.id || s.status === SignerStatus.SIGNED
    ).length;

    const newDocumentStatus =
      signedCount === allSigners.length
        ? DocumentStatus.SIGNED
        : DocumentStatus.PARTIALLY_SIGNED;

    console.log("Updating document status to:", newDocumentStatus);

    await prisma.document.update({
      where: { id: signer.documentId },
      data: { status: newDocumentStatus },
    });

    console.log("✅ Document status updated");
    console.log("✅ SUCCESS - Returning response");

    return res.status(200).json({ message: "Signer accepted.", signature });
  } catch (error) {
    console.error("❌ Error in acceptSigner:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};




/**
 * Reject a signer for a document using token (EXISTING - for external signers)
 */
export const rejectSigner = async (req: Request, res: Response) => {
  let { token } = req.params;
  
  // ✅ Fix TypeScript: token could be string | string[]
  if (Array.isArray(token)) {
    token = token[0];
  }

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
      data: { status: SignerStatus.REJECTED, rejectionReason: reason || "No reason provided" },
    });

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

/**
 * ✅ NEW - Owner manually accepts a signer (mark as SIGNED)
 */
export const ownerAcceptSigner = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    let { documentId, signerId } = req.params;

    // ✅ Fix TypeScript: params could be string | string[]
    if (Array.isArray(documentId)) {
      documentId = documentId[0];
    }
    if (Array.isArray(signerId)) {
      signerId = signerId[0];
    }

    console.log("=== OWNER ACCEPT SIGNER ===");
    console.log("Document ID:", documentId);
    console.log("Signer ID:", signerId);
    console.log("Owner ID:", req.user?.id);

    // Find the signer
    const signer = await prisma.signer.findUnique({
      where: { id: signerId },
      include: { document: true },
    });

    if (!signer) {
      console.log("❌ Signer not found");
      return res.status(404).json({ message: "Signer not found" });
    }

    // Check if user owns the document
    if (signer.document.ownerId !== req.user.id) {
      console.log("❌ Access denied - not owner");
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if signer is pending
    if (signer.status !== SignerStatus.PENDING) {
      console.log(`❌ Signer status is already ${signer.status}`);
      return res.status(400).json({ 
        message: `Signer status is already ${signer.status}` 
      });
    }

    // Update signer to SIGNED
    const updatedSigner = await prisma.signer.update({
      where: { id: signerId },
      data: {
        status: SignerStatus.SIGNED,
        signedAt: new Date(),
      },
    });

    console.log("✅ Signer updated to SIGNED");

    // Update document status if all signers are signed
    const allSigners = await prisma.signer.findMany({
      where: { documentId },
    });

    const allSigned = allSigners.every((s) => s.status === SignerStatus.SIGNED);
    const anySigned = allSigners.some((s) => s.status === SignerStatus.SIGNED);

    let newDocStatus: DocumentStatus = DocumentStatus.PENDING;
    
    if (allSigned) {
      newDocStatus = DocumentStatus.SIGNED;
    } else if (anySigned) {
      newDocStatus = DocumentStatus.PARTIALLY_SIGNED;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: newDocStatus },
    });

    console.log(`✅ Document status updated to ${newDocStatus}`);

    res.status(200).json({
      message: "Signer accepted successfully",
      signer: updatedSigner,
    });
  } catch (error: any) {
    console.error("❌ Error accepting signer:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * ❌ NEW - Owner manually rejects a signer
 */
export const ownerRejectSigner = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    let { documentId, signerId } = req.params;
    const { reason } = req.body;

    // ✅ Fix TypeScript: params could be string | string[]
    if (Array.isArray(documentId)) {
      documentId = documentId[0];
    }
    if (Array.isArray(signerId)) {
      signerId = signerId[0];
    }

    console.log("=== OWNER REJECT SIGNER ===");
    console.log("Document ID:", documentId);
    console.log("Signer ID:", signerId);
    console.log("Reason:", reason);

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ 
        message: "Rejection reason is required (min 3 characters)" 
      });
    }

    // Find the signer
    const signer = await prisma.signer.findUnique({
      where: { id: signerId },
      include: { document: true },
    });

    if (!signer) {
      console.log("❌ Signer not found");
      return res.status(404).json({ message: "Signer not found" });
    }

    // Check if user owns the document
    if (signer.document.ownerId !== req.user.id) {
      console.log("❌ Access denied - not owner");
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if signer is pending
    if (signer.status !== SignerStatus.PENDING) {
      console.log(`❌ Signer status is already ${signer.status}`);
      return res.status(400).json({ 
        message: `Signer status is already ${signer.status}` 
      });
    }

    // Update signer to REJECTED
    const updatedSigner = await prisma.signer.update({
      where: { id: signerId },
      data: {
        status: SignerStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    console.log("✅ Signer updated to REJECTED");

    // Update document status to REJECTED
    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.REJECTED },
    });

    console.log("✅ Document status updated to REJECTED");

    res.status(200).json({
      message: "Signer rejected successfully",
      signer: updatedSigner,
    });
  } catch (error: any) {
    console.error("❌ Error rejecting signer:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};