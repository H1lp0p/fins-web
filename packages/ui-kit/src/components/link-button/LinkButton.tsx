import "./link-button.css";
import type { TextStyleType } from "../../types/textStyleType";
export type LinkButtonVariant = "info" | "success" | "error";

interface LinkButtonProps {
    text: string;
    onClick: () => void;
    variant?: LinkButtonVariant;
    textClassName?: TextStyleType;
    disabled?: boolean;
}

export function LinkButton({ text, onClick, variant = "info", textClassName = "text-info", disabled = false }: LinkButtonProps) {
    
    const handleClick = () => {
        if (disabled) return;
        onClick();
    };
    
    return (
        <span 
            data-variant={variant} 
            className={`fins-link-button ${textClassName}`} 
            onClick={handleClick}
            data-disabled={disabled}
        >
            [{text}]
        </span>
    );
}
