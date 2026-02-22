import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "../ui/Button";
import { Loader } from "../ui/Loader";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

type Props = {
  url: string;
  fileName?: string;
};

export const PdfViewer = ({ url, fileName = "document.pdf" }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const safeUrl = useMemo(() => url?.trim() || "", [url]);

  useEffect(() => {
    if (!safeUrl) return;

    setPageNumber(1);
    setNumPages(0);
    setLoading(true);
    setFetchError(null);
    setPdfBlob(null);

    const token = localStorage.getItem("token");
    let objectUrl = "";

    // ✅ redirect: "follow" handles the backend redirect to Cloudinary
    fetch(safeUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      redirect: "follow",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setPdfBlob(objectUrl);
      })
      .catch((err) => {
        console.error("PDF Fetch Error:", err);
        setFetchError(err.message || "Failed to load PDF");
        setLoading(false);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [safeUrl]);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onLoadError = (err: any) => {
    console.error("PDF Load Error:", err);
    toast.error(`Failed to load PDF${err?.message ? `: ${err.message}` : ""}`);
    setLoading(false);
  };

  const prevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(2.2, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.1));

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(safeUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        redirect: "follow", // ✅ added here too
      });

      if (!response.ok) throw new Error(`Failed to fetch PDF (${response.status})`);

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error("Download Error:", err);
      toast.error(`Failed to download PDF: ${err.message || err}`);
    }
  };

  if (!safeUrl) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center text-gray-600">
        <p className="text-sm">No PDF URL provided</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-red-600 mb-2">Failed to load PDF</p>
        <p className="text-sm text-gray-600">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
            Page {pageNumber} / {numPages || "?"}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={nextPage}
            disabled={numPages === 0 || pageNumber >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="text-sm text-gray-600 w-16 text-center">
            {Math.round(scale * 100)}%
          </div>

          <Button variant="secondary" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={downloadPdf}
            icon={<Download className="w-4 h-4" />}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="p-4 flex justify-center bg-gray-100 min-h-[600px] overflow-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader text="Loading PDF..." />
          </div>
        )}

        <Document
          file={pdfBlob}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={<div />}
          error={
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Failed to load PDF</p>
              <p className="text-sm text-gray-600">
                Please check your internet connection or try again later.
              </p>
            </div>
          }
          noData={
            <div className="text-center py-12">
              <p className="text-gray-600">No PDF file specified</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer
            renderAnnotationLayer
            loading={<div />}
          />
        </Document>
      </div>
    </div>
  );
};