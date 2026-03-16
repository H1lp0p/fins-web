import type { Message } from "../../types/Message";

export function InfoMessage({ type, title, text }: Message) {
    const textColor = type === "info" 
        ? "color-info" 
        : type === "success" 
            ? "color-success" 
            : "color-error";
    

    const prefix = type === "info" 
        ? "[Info]" 
        : type === "success" 
            ? "[Success]" 
            : "[Error]";

    return (
        <div 
            className={`info-message ${textColor}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "start"}}
        >
            <div 
                className="gap-min"
                style={{ display: "flex", flexDirection: "row", alignItems: "start"}}
            >
                <span>{prefix}</span>
                <span>{title}</span>
            </div>
            <span>{text}</span>
        </div>
    )
}
