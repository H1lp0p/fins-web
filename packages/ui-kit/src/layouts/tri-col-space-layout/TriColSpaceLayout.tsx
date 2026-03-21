import { BluredContainer } from "../../components/blured-container/BluredContainer";
import { PlaceholderSpace } from "../../components/placeholder-space/PlaceholderSpace";
import "./tri-col-space-layout.css";

interface TriColSpaceLayoutProps {
    topLeftContent?: React.ReactNode;
    topCenterContent?: React.ReactNode;
    topRightContent?: React.ReactNode;
    bottomLeftContent?: React.ReactNode;
    bottomCenterContent?: React.ReactNode;
    bottomRightContent?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function TriColSpaceLayout({ topLeftContent, topCenterContent, topRightContent, bottomLeftContent, bottomCenterContent, bottomRightContent, className, style }: TriColSpaceLayoutProps) {
    
    const baseStyle = {
        width: "100%",
        height: "100%",
    };
    
    return (
        <div className={`tri-col-space-layout ${className}`} style={style}>
            <div className="top-left-content">
                {!topLeftContent && <PlaceholderSpace />}
                {topLeftContent && 
                    <BluredContainer style={baseStyle}>
                        {topLeftContent}
                    </BluredContainer>
                }
            </div>
            <div className="top-center-content">
                {!topCenterContent && <PlaceholderSpace />}
                {topCenterContent && 
                    <BluredContainer style={baseStyle}>
                        {topCenterContent}
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
            <div className="bottom-left-content">
                {!bottomLeftContent && <PlaceholderSpace />}
                {bottomLeftContent && 
                    <BluredContainer style={baseStyle}>
                        {bottomLeftContent}
                    </BluredContainer>
                }
            </div>
            <div className="bottom-center-content">
                {!bottomCenterContent && <PlaceholderSpace />}
                {bottomCenterContent && 
                    <BluredContainer style={baseStyle}>
                        {bottomCenterContent}
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
    );
}