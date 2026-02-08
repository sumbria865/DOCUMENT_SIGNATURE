/*
  Warnings:

  - A unique constraint covering the columns `[signerId]` on the table `Signature` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documentId,email]` on the table `Signer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Signature_signerId_key" ON "Signature"("signerId");

-- CreateIndex
CREATE UNIQUE INDEX "Signer_documentId_email_key" ON "Signer"("documentId", "email");

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "Signer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
