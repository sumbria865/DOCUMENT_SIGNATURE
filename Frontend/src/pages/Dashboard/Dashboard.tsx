import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { documentService, Document } from "../../services/document.service";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Loader } from "../../components/ui/Loader";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatRelativeTime } from "../../utils/formatDate";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-deployed-k6st.onrender.com/api';

type PendingSignerToken = {
  email: string;
  documentId: string;
  signingUrl: string;
  token: string;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    signed: 0,
    rejected: 0,
  });

  // ✅ pending signer links
  const [pendingTokens, setPendingTokens] = useState<PendingSignerToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchPendingSignerTokens();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getMyDocuments();
      setDocuments(response.documents);

      const total = response.documents.length;
      const pending = response.documents.filter(
        (d) => d.status === "PENDING" || d.status === "PARTIALLY_SIGNED"
      ).length;
      const signed = response.documents.filter((d) => d.status === "SIGNED")
        .length;
      const rejected = response.documents.filter((d) => d.status === "REJECTED")
        .length;

      setStats({ total, pending, signed, rejected });
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch real tokens from backend
  const fetchPendingSignerTokens = async () => {
    try {
      setLoadingTokens(true);

      const res = await axios.get(`${API_BASE_URL}/sign/test-tokens`);

      setPendingTokens(res.data.signers || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch signer tokens");
    } finally {
      setLoadingTokens(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's an overview of your document signing activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Documents"
            value={stats.total}
            color="bg-blue-600"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="bg-yellow-500"
          />
          <StatCard
            icon={CheckCircle}
            label="Signed"
            value={stats.signed}
            color="bg-green-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Rejected"
            value={stats.rejected}
            color="bg-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ready to sign a document?</h2>
            <p className="text-blue-100">
              Upload a PDF and start the signing process
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/documents/upload">
              <Button variant="secondary">
                Upload Document
              </Button>
            </Link>

            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={fetchPendingSignerTokens}
            >
              Refresh Sign Links
            </Button>
          </div>
        </div>

        {/* ✅ Pending Sign Links */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Sign Links
            </h2>
          </div>

          <div className="p-6">
            {loadingTokens ? (
              <Loader text="Loading signer links..." />
            ) : pendingTokens.length === 0 ? (
              <p className="text-gray-600">
                No pending signer links available right now.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingTokens.map((s) => (
                  <div
                    key={s.token}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{s.email}</p>
                      <p className="text-sm text-gray-500">
                        Doc: {s.documentId.slice(0, 8)}
                      </p>
                    </div>

                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                      onClick={() => navigate(`/sign/${s.token}`)}
                    >
                      Open Sign Page <ExternalLink size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Documents
            </h2>
            <Link to="/documents">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          <div className="p-6">
            {isLoading ? (
              <Loader text="Loading documents..." />
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No documents yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload your first document to get started
                </p>
                <Link to="/documents/upload">
                  <Button variant="secondary">Upload Document</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow transition"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-medium">
                          Document #{doc.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(doc.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge status={doc.status} />
                      <Link to={`/documents/${doc.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};