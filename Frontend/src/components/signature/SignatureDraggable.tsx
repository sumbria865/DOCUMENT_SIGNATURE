import { useEffect, useState } from "react";

type Props = {
  src: string;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange?: (width: number, height: number) => void;
  style?: React.CSSProperties;
};

const SignatureDraggable = ({
  src,
  onPositionChange,
  onSizeChange,
  style,
}: Props) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 150, height: 80 });

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Notify parent on mount
  useEffect(() => {
    onPositionChange(position.x, position.y);
  }, []);

  /* ================= DRAG ================= */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (resizing) return;
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
      onPositionChange(newX, newY);
    }

    if (resizing) {
      const newWidth = Math.max(60, e.clientX - position.x);
      const newHeight = Math.max(30, e.clientY - position.y);
      setSize({ width: newWidth, height: newHeight });
      onSizeChange?.(newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  /* ================= RESIZE ================= */
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
          ...style,
        }}
      >
        <img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
          }}
          draggable={false}
          alt="Signature"
        />

        {/* 🔵 Resize handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: "absolute",
            right: -6,
            bottom: -6,
            width: 14,
            height: 14,
            backgroundColor: "#2563eb",
            cursor: "nwse-resize",
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
};

export default SignatureDraggable;
