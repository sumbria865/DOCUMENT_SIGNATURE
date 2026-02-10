import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DrawSignatureProps {
  onConfirm: (signature: string) => void;
  onCancel: () => void;
}

const DrawSignature = ({ onConfirm, onCancel }: DrawSignatureProps) => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleConfirm = () => {
    if (!sigCanvas.current || isEmpty) return;

    const dataURL = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    onConfirm(dataURL);
  };

  const handleBegin = () => {
    if (isEmpty) setIsEmpty(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Draw your signature
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Use your mouse or touchscreen to draw your signature below
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            onBegin={handleBegin}
            backgroundColor="white"
            penColor="black"
            canvasProps={{ className: "w-full h-48" }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClear}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Clear
        </Button>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isEmpty}
            icon={<Check className="w-4 h-4" />}
          >
            Confirm Signature
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DrawSignature;
