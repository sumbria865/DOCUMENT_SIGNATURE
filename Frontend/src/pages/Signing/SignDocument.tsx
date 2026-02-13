import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DrawSignature from "@/components/signature/DrawSignature";
import TypedSignature from "@/components/signature/TypedSignature";
import UploadSignature from "@/components/signature/UploadSignature";
import SignatureDraggable from "@/components/signature/SignatureDraggable";

import { completeSigning } from "@/services/signing.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";

type Position = {
  x: number;
  y: number;
};

const SignDocument = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [tab, setTab] = useState<"typed" | "draw" | "upload">("typed");
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [page] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ EDIT FEATURE: signature resize
  const [signatureWidth, setSignatureWidth] = useState<number>(140);

  /* ----------------------------------------
     Complete signing
  -----------------------------------------*/
  const handleComplete = async () => {
    if (!signatureImg || !position) {
      alert("Please drag and place your signature before completing.");
      return;
    }

    if (!token) {
      alert("Invalid document token!");
      return;
    }

    setLoading(true);

    try {
      await completeSigning({
        token,
        type: tab === "typed" ? "TYPED" : tab === "draw" ? "DRAWN" : "IMAGE",
        signatureImage: signatureImg,
        page,
        x: position.x,
        y: position.y,
      });

      navigate("/sign-complete");
    } catch (err: any) {
      console.error("Signing error:", err.response || err);
      alert("Signing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT – Document preview area */}
      <div className="border rounded-lg h-[500px] relative bg-gray-50 overflow-hidden">
        {signatureImg ? (
          <SignatureDraggable
            src={signatureImg}
            onPositionChange={(x, y) => setPosition({ x, y })}
            style={{
              width: signatureWidth,
              height: tab === "typed" ? signatureWidth / 3 : signatureWidth / 2,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Add a signature → then drag it here
          </div>
        )}
      </div>

      {/* RIGHT – Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add your signature</h2>

        <Tabs
          value={tab}
          onValueChange={(v: string) => {
            setTab(v as "typed" | "draw" | "upload");
            setSignatureImg(null);
            setPosition(null);
          }}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="typed">Typed</TabsTrigger>
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="typed">
            <TypedSignature
              onConfirm={setSignatureImg}
              onCancel={() => setSignatureImg(null)}
            />
          </TabsContent>

          <TabsContent value="draw">
            <DrawSignature
              onConfirm={setSignatureImg}
              onCancel={() => setSignatureImg(null)}
            />
          </TabsContent>

          <TabsContent value="upload">
            <UploadSignature onChange={setSignatureImg} />
          </TabsContent>
        </Tabs>

        {/* ✅ Resize slider */}
        {signatureImg && (
          <div className="mt-4">
            <label className="text-sm text-gray-600 block mb-1">
              Resize signature
            </label>
            <input
              type="range"
              min={80}
              max={250}
              value={signatureWidth}
              onChange={(e) => setSignatureWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        <Button
          className="mt-6 w-full"
          onClick={handleComplete}
          disabled={!signatureImg || !position || loading}
        >
          {loading ? "Signing..." : "Complete Signing"}
        </Button>
      </div>
    </div>
  );
};

export default SignDocument;