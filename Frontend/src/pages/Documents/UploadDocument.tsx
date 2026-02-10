import { useState, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/document.service';
import { Button } from '../../components/ui/Button';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateFile } from '../../utils/validation';

export const UploadDocument = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      toast.error(validation.message || 'Invalid file');
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);

    try {
      const response = await documentService.uploadDocument(file);
      toast.success('Document uploaded successfully!');
      navigate('/documents');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Document
          </h1>
          <p className="text-gray-600">
            Upload a PDF document to start the signing process
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : file
                  ? 'border-success-500 bg-success-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className={`w-16 h-16 ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your PDF here or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF files only, max 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-success-600" />
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-success-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-danger-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary-600 hover:text-primary-700 underline"
                  >
                    Choose a different file
                  </button>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">📝 Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Upload your PDF document using the area above</li>
                <li>Review the document to ensure it's correct</li>
                <li>Add signers who need to sign the document</li>
                <li>Signers will receive an email with a secure link</li>
                <li>Track signing progress in your dashboard</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/documents')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isUploading}
                disabled={!file}
              >
                Upload & Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};