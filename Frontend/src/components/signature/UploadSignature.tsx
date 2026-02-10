import { useRef } from "react";
import { Button } from "../ui/Button";
import { Upload, Image as ImageIcon } from "lucide-react";

interface UploadSignatureProps {
  onChange: (signatureImg: string) => void;
}

const UploadSignature = ({ onChange }: UploadSignatureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    handleFileSelect(file);
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
          hover:border-indigo-500 hover:bg-indigo-50"
      >
        <ImageIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600">
          Click to upload your signature
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG or SVG (recommended)
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          icon={<Upload className="w-4 h-4" />}
        >
          Upload Image
        </Button>
      </div>
    </div>
  );
};

export default UploadSignature;
