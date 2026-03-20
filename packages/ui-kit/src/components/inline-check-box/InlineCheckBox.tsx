import "./inline-check-box.css";
import "../link-button/link-button.css";
import type { TextStyleType } from "../../types/textStyleType";
import type { ColorStyleType } from "../../types/colorStyleType";
import { LoadingFrameIndicator } from "../loading-frame-indicator/LoadingFrameIndicator";
import { LinkButton, type LinkButtonVariant } from "../link-button/LinkButton";

export type statusType = "empty" | "checked" | "denied" | "loading";

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
  /** Не вызывает onClick; чекбокс в стиле disabled LinkButton. */
  disabled?: boolean;
}

export function InlineCheckBox({
  content,
  onClick,
  status = "empty",
  textClassName = "text-info",
  contentColor = "color-info",
  disabled = false,
}: InlineCheckBoxProps) {
  const checkBoxVariant: LinkButtonVariant =
    status === "checked"
      ? "success"
      : status === "denied"
        ? "error"
        : "info";

  const handleClick = () => {
    if (disabled || status === "loading") {
      return;
    }
    onClick(status);
  };

  return (
    <div
      className={`fins-inline-check-box-container ${textClassName}`}
      aria-busy={status === "loading" || undefined}
      aria-disabled={disabled || undefined}
    >
      <span
        className={` ${textClassName} ${contentColor}`}
        aria-hidden={status === "loading"}
      >
        - {content}
      </span>{" "}
      {status === "loading" ? (
        <span
          className={`fins-link-button ${textClassName}`}
          data-variant={checkBoxVariant}
          data-disabled={disabled || undefined}
          onClick={handleClick}
        >
          <span className="text-info">
            [
            <LoadingFrameIndicator className="text-info color-input-placeholder" />
            ]
          </span>
        </span>
      ) : (
        <LinkButton
          text={staticCheckboxLabel(status)}
          variant={checkBoxVariant}
          onClick={handleClick}
          textClassName={textClassName}
          disabled={disabled}
        />
      )}
    </div>
  );
}
