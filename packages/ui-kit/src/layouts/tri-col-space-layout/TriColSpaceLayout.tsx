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

export function TriColSpaceLayout({
    topLeftContent,
    topCenterContent,
    topRightContent,
    bottomLeftContent,
    bottomCenterContent,
    bottomRightContent,
    className,
    style,
}: TriColSpaceLayoutProps) {
    const baseStyle = {
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        boxSizing: "border-box" as const,
        overflow: "auto" as const,
    };

    return (
        <div className={`tri-col-space-layout ${className ?? ""}`.trim()} style={style}>
            <div className="tri-col-space-layout__row tri-col-space-layout__row--top">
                <div className="tri-col-space-layout__cell tri-col-space-layout__cell--side">
                    {!topLeftContent && <PlaceholderSpace compact />}
                    {topLeftContent && (
                        <BluredContainer style={baseStyle}>
                            {topLeftContent}
                        </BluredContainer>
                    )}
                </div>
                <div className="tri-col-space-layout__cell tri-col-space-layout__cell--center">
                    {!topCenterContent && <PlaceholderSpace compact />}
                    {topCenterContent && (
                        <BluredContainer style={baseStyle}>
                            {topCenterContent}
                        </BluredContainer>
                    )}
                </div>
                <div className="tri-col-space-layout__cell tri-col-space-layout__cell--side">
                    {!topRightContent && <PlaceholderSpace compact />}
                    {topRightContent && (
                        <BluredContainer style={baseStyle}>
                            {topRightContent}
                        </BluredContainer>
                    )}
                </div>
            </div>
            <div className="tri-col-space-layout__row tri-col-space-layout__row--bottom">
                <div className="tri-col-space-layout__cell tri-col-space-layout__cell--side">
                    {!bottomLeftContent && <PlaceholderSpace />}
                    {bottomLeftContent && (
                        <BluredContainer style={baseStyle}>
                            {bottomLeftContent}
                        </BluredContainer>
                    )}
                </div>
                <div className="tri-col-space-layout__cell tri-col-space-layout__cell--center">
                    {!bottomCenterContent && <PlaceholderSpace />}
                    {bottomCenterContent && (
                        <BluredContainer style={baseStyle}>
                            {bottomCenterContent}
                        </BluredContainer>
                    )}
                </div>
                <div className="tri-col-space-layout__cell tri-col-space-layout__cell--side">
                    {!bottomRightContent && <PlaceholderSpace />}
                    {bottomRightContent && (
                        <BluredContainer style={baseStyle}>
                            {bottomRightContent}
                        </BluredContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
