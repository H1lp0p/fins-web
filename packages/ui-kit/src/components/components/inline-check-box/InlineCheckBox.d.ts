import { TextStyleType } from '../../../../dist/types/textStyleType';
import { ColorStyleType } from '../../../../dist/types/colorStyleType';
export type statusType = "empty" | "checked" | "denied" | "loading";
interface InlineCheckBoxProps {
    content: string;
    onClick: (currentStatus: statusType) => void;
    status?: statusType;
    textClassName?: TextStyleType;
    contentColor?: ColorStyleType;
}
export declare function InlineCheckBox({ content, onClick, status, textClassName, contentColor, }: InlineCheckBoxProps): import("react/jsx-runtime").JSX.Element;
export {};
