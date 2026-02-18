import prisma from "../../config/db";
import cloudinary from "../../config/cloudinary";
import crypto from "crypto";
import { DocumentStatus } from "@prisma/client";

export const uploadDocument = async (ownerId: string, fileBuffer: Buffer) => {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "documents",
            format: "pdf",
            type: "upload",
            access_mode: "public",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(fileBuffer);
    });

    const document = await prisma.document.create({
      data: {
        ownerId,
        originalUrl: uploadResult.secure_url,
        status: DocumentStatus.PENDING,
      },
    });

    await prisma.auditLog.create({
      data: {
        documentId: document.id,
        action: "DOCUMENT_CREATED",
        ipAddress: "system",
        userAgent: "system",
      },
    });

    return document;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }
};

export const getDocumentsByUser = async (ownerId: string) => {
  try {
    const documents = await prisma.document.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error("Failed to fetch documents");
  }
};

export const getDocumentByIdService = async (id: string) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        signers: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return document;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
};

export const uploadSignedDocumentService = async (
  documentId: string,
  fileBuffer: Buffer
) => {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "signed-documents",
            format: "pdf",
            type: "upload",
            access_mode: "public",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(fileBuffer);
    });

    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: {
        signedUrl: uploadResult.secure_url,
        status: DocumentStatus.SIGNED,
      },
    });

    await prisma.auditLog.create({
      data: {
        documentId,
        action: "DOCUMENT_SIGNED",
        ipAddress: "system",
        userAgent: "system",
      },
    });

    return updatedDoc;
  } catch (error) {
    console.error("Error uploading signed document:", error);
    throw new Error("Failed to upload signed document");
  }
};

export const addSignersService = async (
  documentId: string,
  emails: string[],
  ownerId: string
) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(
      (email) => !emailRegex.test(email.trim())
    );

    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email format: ${invalidEmails.join(", ")}`);
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { signers: true },
    });

    if (!document) throw new Error("Document not found");

    if (document.ownerId !== ownerId) {
      throw new Error("You do not have permission to add signers");
    }

    const existingEmails = document.signers.map((s) => s.email.toLowerCase());
    const newEmails = emails.map((e) => e.trim().toLowerCase());
    const duplicates = newEmails.filter((email) =>
      existingEmails.includes(email)
    );

    if (duplicates.length > 0) {
      throw new Error(
        `The following emails are already signers: ${duplicates.join(", ")}`
      );
    }

    const signersData = newEmails.map((email) => ({
      documentId,
      email,
      token: crypto.randomBytes(32).toString("hex"),
      status: "PENDING" as const,
    }));

    const createdSigners = await Promise.all(
      signersData.map((signerData) =>
        prisma.signer.create({ data: signerData })
      )
    );

    console.log("\n" + "=".repeat(80));
    console.log("📧 SIGNERS CREATED - SIGNING LINKS:");
    console.log("=".repeat(80));
    createdSigners.forEach((signer, index) => {
      console.log(`\n[${index + 1}] Email: ${signer.email}`);
      console.log(`    Token: ${signer.token}`);
      console.log(`    Signing URL: http://localhost:3000/sign/${signer.token}`);
      console.log("-".repeat(80));
    });
    console.log("=".repeat(80) + "\n");

    await prisma.auditLog.create({
      data: {
        documentId,
        action: `SIGNERS_ADDED (${createdSigners.length}): ${newEmails.join(", ")}`,
        ipAddress: "system",
        userAgent: "system",
      },
    });

    return createdSigners;
  } catch (error) {
    console.error("Error adding signers:", error);
    throw error;
  }
};