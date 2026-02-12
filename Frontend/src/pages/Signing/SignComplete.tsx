import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

const SignComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Document Signed Successfully
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for signing the document. Your signature has been securely
          recorded and the document owner has been notified.
        </p>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate("/")}>
            Go to Home
          </Button>

          <p className="text-sm text-gray-400">
            You may now safely close this window.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignComplete;
