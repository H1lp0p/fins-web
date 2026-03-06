import "./blured-container.css";

interface BluredContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function BluredContainer({ children, style, className }: BluredContainerProps) {
  return (
    <div className={`fins-blured-container ${className}`} style={style}>
      {children}
    </div>
  );
}
