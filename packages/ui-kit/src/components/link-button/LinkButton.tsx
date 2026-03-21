import "./link-button.css";
import type { TextStyleType } from "../../types/textStyleType";
export type LinkButtonVariant = "info" | "success" | "error";

interface LinkButtonProps {
    text: string;
    onClick: () => void;
    variant?: LinkButtonVariant;
    textClassName?: TextStyleType;
}

export function LinkButton({ text, onClick, variant = "info", textClassName = "text-info" }: LinkButtonProps) {
    return (
        <span 
            data-variant={variant} 
            className={`fins-link-button ${textClassName}`} 
            onClick={onClick}
        >
            [{text}]
        </span>
    );
}
