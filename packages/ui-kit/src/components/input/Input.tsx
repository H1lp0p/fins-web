import type { TextStyleType } from "../../types/textStyleType";
import "./input.css";
import { OnBlurContainer } from "../on-blur-container/OnBlurContainer";
import type { DEFAULT_CHARS } from "../../types/DefaultChars";

interface InputProps {
    title?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    isValid?: boolean;
    charReplacement?: string;
    textClassName?: TextStyleType;
    trailingChar?: DEFAULT_CHARS;
}

export function Input({
    title,
    placeholder, 
    value = undefined,
    onChange = () => {},
    isValid = true,
    charReplacement,
    textClassName = "text-info",
    trailingChar,
}: InputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const valueToDisplay = 
        charReplacement 
            ? value && value.length > 0
                ? charReplacement.repeat(value.length)
                : undefined
            : value;

    const inputTextColor = 
        isValid === true 
            ? "color-info"
            : "color-error";

    return (
        <OnBlurContainer 
        className={`input-container ${textClassName}`}>
            <span className="color-info">{title}</span>
            <span className="color-info">/</span>
            <input 
                className={`${inputTextColor} ${textClassName}`}
                type="text"
                placeholder={placeholder}
                value={valueToDisplay}
                onChange={handleChange}
            />
            {trailingChar && (
                <span className={`color-success ${textClassName}`}>{trailingChar}</span>
            )}
        </OnBlurContainer>
    );
}