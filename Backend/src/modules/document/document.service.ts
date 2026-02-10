import prisma from "../../config/db";
import cloudinary from "../../config/cloudinary";
import crypto from "crypto";

/**
 * Upload a PDF document to Cloudinary and save metadata in DB
 */
export const uploadDocument = async (ownerId: string, fileBuffer: Buffer) => {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "raw", folder: "documents" },
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
      },
    });

    return document;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }
};

/**
 * Fetch all documents uploaded by a specific user
 */
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

/**
 * ✅ Get document by ID (for View Details page)
 */
export const getDocumentByIdService = async (id: string) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        signers: true,
      },
    });

    return document;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
};

/**
 * ✅ Upload signed PDF + update document signedUrl + status
 */
export const uploadSignedDocumentService = async (
  documentId: string,
  fileBuffer: Buffer
) => {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "raw", folder: "signed-documents" },
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
        status: "SIGNED",
      },
    });

    return updatedDoc;
  } catch (error) {
    console.error("Error uploading signed document:", error);
    throw new Error("Failed to upload signed document");
  }
};

/**
 * ✅ Add signers to a document
 */
export const addSignersService = async (
  documentId: string,
  emails: string[],
  ownerId: string
) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(
      (email) => !emailRegex.test(email.trim())
    );

    if (invalidEmails.length > 0) {
      throw new Error(
        `Invalid email format: ${invalidEmails.join(", ")}`
      );
    }

    // Check if document exists and user owns it
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        signers: true,
      },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    if (document.ownerId !== ownerId) {
      throw new Error(
        "You do not have permission to add signers to this document"
      );
    }

    // Check for duplicate emails
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

    // Create signers with unique tokens
    const signersData = newEmails.map((email: string) => ({
      documentId: documentId,
      email: email,
      token: crypto.randomBytes(32).toString("hex"),
      status: "PENDING" as const,
    }));

    // Create signers in database
    const createdSigners = await Promise.all(
      signersData.map((signerData) =>
        prisma.signer.create({
          data: signerData,
        })
      )
    );

    // ✅ LOG TOKENS FOR TESTING - ADD THIS BLOCK
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        documentId: documentId,
        action: `Added ${createdSigners.length} signer(s): ${newEmails.join(", ")}`,
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