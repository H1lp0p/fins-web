import type { CSSProperties } from "react";

export type CenteredPlaceholderProps = {
  /** Кодовый текст в стиле `items.length === 0`. */
  text: string;
  className?: string;
  style?: CSSProperties;
};

/** Плейсхолдер по центру flex-контейнера (`flex: 1`, `minHeight: 0`). */
export function CenteredPlaceholder({
  text,
  className = "text-info color-info",
  style,
}: CenteredPlaceholderProps) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <span className={className}>{text}</span>
    </div>
  );
}
