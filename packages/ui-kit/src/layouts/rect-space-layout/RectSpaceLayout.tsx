import { BluredContainer } from "../../components/blured-container/BluredContainer";
import { PlaceholderSpace } from "../../components/placeholder-space/PlaceholderSpace";
import "./rect-space-layout.css";

interface RectSpaceLayoutProps {
    topLeftContent?: React.ReactNode;
    topRightContent?: React.ReactNode;
    bottomLeftContent?: React.ReactNode;
    bottomRightContent?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function RectSpaceLayout({ topLeftContent, topRightContent, bottomLeftContent, bottomRightContent, className, style }: RectSpaceLayoutProps) {

    const baseStyle = {
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        boxSizing: "border-box" as const,
        overflow: "auto" as const,
    };

    return (
        <div className={`rect-space-layout ${className}`} style={style}>
            <div className="rect-space-layout__row rect-space-layout__row--top">
                <div className="top-left-content">
                    {!topLeftContent && <PlaceholderSpace />}
                    {topLeftContent &&
                        <BluredContainer style={baseStyle}>
                            {topLeftContent}
                        </BluredContainer>
                    }
                </div>
                <div className="top-right-content">
                    {!topRightContent && <PlaceholderSpace />}
                    {topRightContent &&
                        <BluredContainer style={baseStyle}>
                            {topRightContent}
                        </BluredContainer>
                    }
                </div>
            </div>
            <div className="rect-space-layout__row rect-space-layout__row--bottom">
                <div className="bottom-left-content">
                    {!bottomLeftContent && <PlaceholderSpace />}
                    {bottomLeftContent &&
                        <BluredContainer style={baseStyle}>
                            {bottomLeftContent}
                        </BluredContainer>
                    }
                </div>
                <div className="bottom-right-content">
                    {!bottomRightContent && <PlaceholderSpace />}
                    {bottomRightContent &&
                        <BluredContainer style={baseStyle}>
                            {bottomRightContent}
                        </BluredContainer>
                    }
                </div>
            </div>
        </div>
    );
}
