import "./bg-text.css";

interface BgTextProps {
    text: string;
}

export function BgText({ text }: BgTextProps) {
    return (
        <div className="bg-text color-success text-absolute">
            {text}
        </div>
    );
}