import { TextStyleType } from '../../../../dist/types/textStyleType';
import { DEFAULT_CHARS } from '../../../../dist/types/DefaultChars';
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
export declare function Input({ title, placeholder, value, onChange, isValid, charReplacement, textClassName, trailingChar, }: InputProps): import("react/jsx-runtime").JSX.Element;
export {};
