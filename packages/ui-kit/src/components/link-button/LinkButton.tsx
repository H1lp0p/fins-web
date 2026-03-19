import "./link-button.css";
import type { TextStyleType } from "../../types/textStyleType";
export type LinkButtonVariant = "info" | "success" | "error";

interface LinkButtonProps {
    text: string;
    onClick: () => void;
    variant?: LinkButtonVariant;
    textClassName?: TextStyleType;
    loading?: boolean;
    disabled?: boolean;
}

export function LinkButton({ text, onClick, variant = "info", textClassName = "text-info", disabled = false, loading = false }: LinkButtonProps) {
    
    const handleClick = () => {
        if (disabled || loading) return;
        onClick();
    };
    
    return (
        <span 
            data-variant={variant} 
            className={`fins-link-button ${textClassName}`} 
            onClick={handleClick}
            data-disabled={disabled}
        >
            
            {loading ? 
            <span className="text-info color-input-placeholder">…</span> : 
            <span className="text-info">
                [{text}]
            </span>
            }
        </span>
    );
}
