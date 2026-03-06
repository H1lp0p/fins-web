import { useEffect, useState } from "react";
import "./inline-check-box.css";
import type { TextStyleType } from "../../types/textStyleType";
import type { ColorStyleType } from "../../types/colorStyleType";
import { LinkButton, type LinkButtonVariant } from "../link-button/LinkButton";

export type statusType = "empty" | "checked" | "denied" | "loading";

const LOADING_FRAMES = ["|..", ".|.", "..|"] as const;
const LOADING_INTERVAL_MS = 250;

function staticCheckboxLabel(status: Exclude<statusType, "loading">): string {
  switch (status) {
    case "empty":
      return "   ";
    case "checked":
      return " / ";
    case "denied":
      return " X ";
  }
}

interface InlineCheckBoxProps {
  content: string;
  onClick: (currentStatus: statusType) => void;
  status?: statusType;
  textClassName?: TextStyleType;
  contentColor?: ColorStyleType;
}

export function InlineCheckBox({
  content,
  onClick,
  status = "empty",
  textClassName = "text-info",
  contentColor = "color-info",
}: InlineCheckBoxProps) {
  const [loadingFrame, setLoadingFrame] = useState(0);

  useEffect(() => {
    if (status !== "loading") {
      return;
    }
    setLoadingFrame(0);
    const id = window.setInterval(() => {
      setLoadingFrame((i) => (i + 1) % LOADING_FRAMES.length);
    }, LOADING_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [status]);

  const checkboxLabel =
    status === "loading"
      ? LOADING_FRAMES[loadingFrame]
      : staticCheckboxLabel(status);
    
  const checkBoxVariant : LinkButtonVariant = 
    status === "checked" 
        ? "success" 
        : status === "denied" 
            ? "error" 
            : "info";

  const handleClick = () => {
    
    if (status === "loading") {
      return;
    }
    
    onClick(status);
  };
            
  return (
    <div
      className={`fins-inline-check-box-container ${textClassName}`}
      aria-busy={status === "loading" || undefined}
    >
      <span 
      className={` ${textClassName} ${contentColor}`} 
      aria-hidden={status === "loading"}>
        - {content}
      </span>
      {" "}
      <LinkButton
        text={checkboxLabel}
        variant={checkBoxVariant}
        onClick={handleClick}
        textClassName={textClassName}
      />
    </div>
  );
}
