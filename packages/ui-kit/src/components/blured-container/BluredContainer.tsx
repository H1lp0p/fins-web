import "./blured-container.css";

interface BluredContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function BluredContainer({ children, style }: BluredContainerProps) {
  return (
    <div className="fins-blured-container" style={style}>
      {children}
    </div>
  );
}
