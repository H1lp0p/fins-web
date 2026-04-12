import type { TextStyleType } from "../../types/textStyleType";

interface LogoProps {
    textStyle?: TextStyleType;
}

export function Logo({ textStyle = "text-title" }: LogoProps) {
    return (
        <div className={`${textStyle}`} style={{
            display: "block",
            gap: "0",
            letterSpacing: "-0.1em",
        }}>
            <span className="color-success">$</span>
            <span className="color-info">Fins</span>
        </div>
    );
}