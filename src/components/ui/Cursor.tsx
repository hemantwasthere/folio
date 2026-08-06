interface CursorProps {
  mouseX: number;
  mouseY: number;
  scale: number;
  opacity: number;
}

const Cursor: React.FC<CursorProps> = ({ mouseX, mouseY, scale, opacity }) => {
  return (
    <div
      className="fixed left-0 top-0 h-[30px] w-[30px] rounded-full border border-text_secondary z-30 pointer-events-none"
      style={{
        transform: `translateX(${mouseX - 15}px) translateY(${
          mouseY - 15
        }px) scale(${scale})`,
        opacity: opacity,
        transition: "0.3s all cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    />
  );
};

export default Cursor;
