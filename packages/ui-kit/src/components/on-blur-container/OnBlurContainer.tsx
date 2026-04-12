export function OnBlurContainer({ children, className = "", style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`bg-on-blur rounded ${className}`} style={style}>
      {children}
    </div>
  );
}