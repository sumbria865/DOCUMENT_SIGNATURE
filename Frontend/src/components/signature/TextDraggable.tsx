import { useEffect, useState } from "react";

type Props = {
  text: string;
  onPositionChange: (x: number, y: number) => void;
  fontSize?: number;
};

const TextDraggable = ({ text, onPositionChange, fontSize = 16 }: Props) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Send initial position to parent
  useEffect(() => {
    onPositionChange(position.x, position.y);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const stopDragging = () => setDragging(false);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          cursor: dragging ? "grabbing" : "grab",
          fontSize,
          fontWeight: 600,
          background: "rgba(255,255,255,0.9)",
          padding: "4px 6px",
          borderRadius: "4px",
          border: "1px dashed #999",
          userSelect: "none",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default TextDraggable;
