import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  ArrowLeft,
  Download,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { documentService, Document } from "../../services/document.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/ui/Loader";
import { Input } from "../../components/ui/Input";
import { formatDate } from "../../utils/formatDate";
import { PdfViewer } from "../../components/pdf/PdfViewer";

const API_BASE_URL = "https://bac-dep.onrender.com/api";

export const DocumentDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [emails, setEmails] = useState<string>("");
  const [isAddingSigners, setIsAddingSigners] = useState(false);
  const [isDownloadingOriginal, setIsDownloadingOriginal] = useState(false);
  const [updatingSignerId, setUpdatingSignerId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Set PDF URL to backend proxy — streams through backend with auth
  useEffect(() => {
    if (!document) return;
    // PdfViewer sends Authorization header automatically, backend proxies to Cloudinary
    setPdfUrl(`${API_BASE_URL}/documents/${document.id}/file`);
  }, [document?.id]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getDocumentById(id!);
      setDocument(data.document);
    } catch (error: any) {
      console.error("Error fetching document:", error);
      toast.error("Failed to fetch document details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSigners = async () => {
    if (!document) return;

    const emailList = emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      toast.error("Please enter at least 1 email");
      return;
    }

    try {
      setIsAddingSigners(true);
      await documentService.addSigners(document.id, emailList);
      toast.success("Signers added successfully");
      setEmails("");
      await fetchDocument();
    } catch (error: any) {
      console.error("Error adding signers:", error);
      toast.error(error.response?.data?.message || "Failed to add signers");
    } finally {
      setIsAddingSigners(false);
    }
  };

  const handleDownloadOriginal = async () => {
    try {
      if (!document?.originalUrl) {
        toast.error("Original file not found");
        return;
      }

      setIsDownloadingOriginal(true);

      const originalFileName = `document-${document.id}.pdf`;
      const blob = await documentService.downloadFile(document.originalUrl);

      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = originalFileName;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Original PDF downloaded");
    } catch (error: any) {
      console.error("Download original error:", error);
      toast.error("Failed to download original PDF");
    } finally {
      setIsDownloadingOriginal(false);
    }
  };

  const handleAcceptSigner = async (signerId: string) => {
    if (!document) return;

    try {
      setUpdatingSignerId(signerId);
      await documentService.acceptSigner(document.id, signerId);
      toast.success("Signer marked as SIGNED ✅");
      await fetchDocument();
    } catch (error: any) {
      console.error("Accept signer error:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark signer as signed"
      );
    } finally {
      setUpdatingSignerId(null);
    }
  };

  const handleRejectSigner = async (signerId: string) => {
    if (!document) return;

    const reason = window.prompt("Enter rejection reason:");
    if (!reason || reason.trim().length < 3) {
      toast.error("Rejection reason is required (min 3 characters)");
      return;
    }

    try {
      setUpdatingSignerId(signerId);
      await documentService.rejectSigner(document.id, signerId, reason);
      toast.success("Signer marked as REJECTED ❌");
      await fetchDocument();
    } catch (error: any) {
      console.error("Reject signer error:", error);
      toast.error(error.response?.data?.message || "Failed to reject signer");
    } finally {
      setUpdatingSignerId(null);
    }
  };

  const handleDownloadSigned = () => {
    if (!document?.signedUrl) return;

    const link = window.document.createElement("a");
    link.href = document.signedUrl;
    link.download = `document-${document.id}-signed.pdf`;
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader text="Loading document..." />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Document not found</p>
          <Link to="/documents">
            <Button variant="primary">Back to My Documents</Button>
          </Link>
        </div>
      </div>
    );
  }

  const originalFileName = `document-${document.id}.pdf`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link to="/documents">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Document Details
              </h1>
              <p className="text-sm text-gray-600">
                Document #{document.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <Badge status={document.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF Preview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Preview PDF
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleDownloadOriginal}
                  disabled={isDownloadingOriginal}
                >
                  {isDownloadingOriginal ? "Downloading..." : "Download Original"}
                </Button>

                {document.signedUrl && (
                  <Button
                    variant="primary"
                    icon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadSigned}
                  >
                    Download Signed
                  </Button>
                )}
              </div>
            </div>

            {!pdfUrl ? (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center text-gray-600">
                <p className="text-sm">No PDF available for this document.</p>
              </div>
            ) : (
              <PdfViewer url={pdfUrl} fileName={originalFileName} />
            )}
          </div>

          {/* Info + Signers */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Document Info
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Document ID</p>
                <p className="font-medium text-gray-900 break-all">
                  {document.id}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Owner ID</p>
                <p className="font-medium text-gray-900 break-all">
                  {document.ownerId}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">
                  {formatDate(document.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Updated At</p>
                <p className="font-medium text-gray-900">
                  {formatDate(document.updatedAt)}
                </p>
              </div>
            </div>

            {/* SIGNERS */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Signers
              </h3>

              {document.signers && document.signers.length > 0 ? (
                <div className="space-y-3">
                  {document.signers.map((signer) => {
                    const isPending = signer.status === "PENDING";
                    const isUpdating = updatingSignerId === signer.id;

                    return (
                      <div
                        key={signer.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-sm font-medium text-gray-900 break-all">
                          {signer.email}
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          Status:{" "}
                          <span className="font-semibold">{signer.status}</span>
                        </p>

                        {signer.signedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Signed At: {formatDate(signer.signedAt)}
                          </p>
                        )}

                        {signer.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {signer.rejectionReason}
                          </p>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="primary"
                            icon={<CheckCircle className="w-4 h-4" />}
                            onClick={() => handleAcceptSigner(signer.id)}
                            disabled={!isPending || isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Accept"}
                          </Button>

                          <Button
                            variant="danger"
                            icon={<XCircle className="w-4 h-4" />}
                            onClick={() => handleRejectSigner(signer.id)}
                            disabled={!isPending || isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Reject"}
                          </Button>
                        </div>

                        {!isPending && (
                          <p className="text-xs text-gray-400 mt-2">
                            This signer status is finalized.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No signers added yet.</p>
              )}
            </div>

            {/* ADD SIGNERS */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary-600" />
                Add Signers
              </h3>

              <p className="text-xs text-gray-500 mb-3">
                Enter emails separated by commas.
              </p>

              <Input
                placeholder="example@gmail.com, test@gmail.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
              />

              <Button
                variant="primary"
                className="mt-3 w-full"
                onClick={handleAddSigners}
                disabled={isAddingSigners}
              >
                {isAddingSigners ? "Adding..." : "Add Signers"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};