import { formatNumber } from "../../lib/formatNumber";
import type { DEFAULT_CHARS } from "../../types/DefaultChars";
import type { TextStyleType } from "../../types/textStyleType";
import "./amount-with-symb.css";

interface AmountWithSymbolProps {
    amount: number;
    symbol: DEFAULT_CHARS;
    textClassName?: TextStyleType;
    className?: string;
    style?: React.CSSProperties;
}

export function AmountWithSymbol({ amount, symbol, textClassName = "text-info", className = "", style = {} }: AmountWithSymbolProps) {
    return (
        <div className={`amount-with-symbol ${textClassName} ${className}`} style={style}>
            <span className="color-info">{formatNumber(amount)}</span>
            <span className="color-success">{symbol}</span>
        </div>
    );
}
