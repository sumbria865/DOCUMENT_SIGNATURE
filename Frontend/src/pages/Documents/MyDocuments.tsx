import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Upload, Search, Filter } from "lucide-react";

import { documentService, Document } from "../../services/document.service";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Loader } from "../../components/ui/Loader";
import { Input } from "../../components/ui/Input";
import { formatDate } from "../../utils/formatDate";

export const MyDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, statusFilter, documents]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getMyDocuments();

      setDocuments(response.documents);
      setFilteredDocuments(response.documents);
    } catch (error: any) {
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    // Filter by search query (ID)
    if (searchQuery.trim()) {
      filtered = filtered.filter((doc) =>
        doc.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Documents
            </h1>
            <p className="text-gray-600">
              Manage and track all your documents
            </p>
          </div>

          <Link to="/documents/upload">
            <Button
              variant="primary"
              icon={<Upload className="w-4 h-4" />}
              className="mt-4 md:mt-0"
            >
              Upload Document
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by document ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5 text-gray-400" />}
            />

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_SIGNED">Partially Signed</option>
                <option value="SIGNED">Signed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          {isLoading ? (
            <div className="p-12">
              <Loader text="Loading documents..." />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-600 mb-6">
                {documents.length === 0
                  ? "You haven't uploaded any documents yet"
                  : "Try adjusting your filters"}
              </p>

              {documents.length === 0 && (
                <Link to="/documents/upload">
                  <Button
                    variant="primary"
                    icon={<Upload className="w-4 h-4" />}
                  >
                    Upload Your First Document
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Document */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary-50 rounded-lg">
                            <FileText className="w-5 h-5 text-primary-600" />
                          </div>

                          <div>
                            <div className="font-medium text-gray-900">
                              Document #{doc.id.slice(0, 8)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {doc.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge status={doc.status} />
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(doc.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Details
                          </Link>

                          <span className="text-gray-300">|</span>

                          <a
                            href={doc.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {!isLoading && filteredDocuments.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        )}
      </div>
    </div>
  );
};
