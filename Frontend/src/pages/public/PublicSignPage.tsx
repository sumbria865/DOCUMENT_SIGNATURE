import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import { Loader } from "../../components/ui/Loader";
import { PdfViewer } from "../../components/pdf/PdfViewer";
import { Button } from "../../components/ui/Button";

type SignerInfo = {
  signerId: string;
  email: string;
  documentId: string;
  pdfUrl: string;
};

export const PublicSignPage = () => {
  const { token } = useParams<{ token: string }>();

  const [data, setData] = useState<SignerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/sign/verify/${token}`
      );

      setData(res.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Invalid or expired signing link"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Verifying signing link..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Signing link is invalid or expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-2">Sign Document</h1>
        <p className="text-sm text-gray-600 mb-4">
          Signing as <strong>{data.email}</strong>
        </p>

        {/* PDF Preview */}
        <PdfViewer url={data.pdfUrl} fileName="document.pdf" />

        {/* Next step button (enabled after drag-drop UI) */}
        <Button className="mt-4" disabled>
          Continue to Sign
        </Button>
      </div>
    </div>
  );
};
