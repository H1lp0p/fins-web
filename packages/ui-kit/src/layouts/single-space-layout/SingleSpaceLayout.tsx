import { BluredContainer } from "../../components/blured-container/BluredContainer";
import { PlaceholderSpace } from "../../components/placeholder-space/PlaceholderSpace";
import "./single-space-layout.css";

interface SingleSpaceLayoutProps {
    children?: React.ReactNode | React.ReactNode[];
    className?: string;
    style?: React.CSSProperties;
}

export function SingleSpaceLayout({ 
    children, 
    className = "ph-max pv-max gap-mid", 
    style = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
 }: SingleSpaceLayoutProps) {
    return (
        <div className="single-space-layout">
            {!children && (
                <PlaceholderSpace />
            )}
            {children && Array.isArray(children) && children.map((child, index) => (
                <BluredContainer className={className} style={style} key={index}>
                    {child}
                </BluredContainer>
            ))}
            {children && !Array.isArray(children) && (
                <BluredContainer className={className} style={style}>
                    {children}
                </BluredContainer>
            )}
        </div>
    );
}