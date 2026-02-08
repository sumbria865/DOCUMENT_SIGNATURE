// src/modules/document/document.service.ts
import prisma from "../../config/db";
import cloudinary from "../../config/cloudinary";

/**
 * Upload a PDF document to Cloudinary and save metadata in DB
 */
export const uploadDocument = async (ownerId: string, fileBuffer: Buffer) => {
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "documents" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(fileBuffer);
    });

    // Save document info in DB
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
