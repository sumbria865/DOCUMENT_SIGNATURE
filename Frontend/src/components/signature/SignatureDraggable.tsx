import { useEffect, useState } from "react";

type Props = {
  src: string;
  onPositionChange: (x: number, y: number) => void;
  style?: React.CSSProperties; // optional styles like width/height
};

const SignatureDraggable = ({ src, onPositionChange, style }: Props) => {
  // Default initial position
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Call parent once on mount
  useEffect(() => {
    onPositionChange(position.x, position.y);
  }, []);

  // Mouse / touch handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    setPosition({ x: newX, y: newY });
    onPositionChange(newX, newY);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={src}
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
          ...style,
        }}
        draggable={false} // disable default drag behavior
        alt="Signature"
      />
    </div>
  );
};

export default SignatureDraggable;
