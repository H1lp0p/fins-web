import { TextStyleType } from '../../../../dist/types/textStyleType';
export type LinkButtonVariant = "info" | "success" | "error";
interface LinkButtonProps {
    text: string;
    onClick: () => void;
    variant?: LinkButtonVariant;
    textClassName?: TextStyleType;
}
export declare function LinkButton({ text, onClick, variant, textClassName }: LinkButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
