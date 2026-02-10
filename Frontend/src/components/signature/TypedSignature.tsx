import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Type } from "lucide-react";

interface TypedSignatureProps {
  onConfirm: (signatureImg: string) => void;
  onCancel: () => void;
}

const TypedSignature = ({ onConfirm, onCancel }: TypedSignatureProps) => {
  const [text, setText] = useState("");
  const [selectedFont, setSelectedFont] = useState("Brush Script MT");

  const fonts = [
    "Brush Script MT",
    "Lucida Handwriting",
    "Edwardian Script ITC",
    "Vivaldi",
    "cursive",
  ];

  const handleConfirm = () => {
    if (!text.trim()) return;

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 150;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Signature text
    ctx.font = `48px "${selectedFont}"`;
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Convert to base64 image
    const dataUrl = canvas.toDataURL("image/png");

    // Send image back to parent
    onConfirm(dataUrl);
  };

  return (
    <div className="space-y-6">
      <Input
        label="Type your signature"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="John Doe"
        icon={<Type className="w-5 h-5 text-gray-400" />}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose font style
        </label>

        <div className="grid gap-2">
          {fonts.map((font) => (
            <button
              key={font}
              type="button"
              onClick={() => setSelectedFont(font)}
              className={`p-4 border rounded-lg text-left transition ${
                selectedFont === font
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                style={{
                  fontFamily: font,
                  fontSize: 24,
                }}
              >
                {text || "Your Signature"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!text.trim()}
        >
          Confirm Signature
        </Button>
      </div>
    </div>
  );
};

export default TypedSignature;
