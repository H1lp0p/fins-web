import { BluredContainer } from "../blured-container/BluredContainer";
import { Logo } from "../logo/Logo";

type PlaceholderSpaceProps = {
    /** В сетках вроде RectSpaceLayout — меньше логотип, без «шторы» на весь ряд. */
    compact?: boolean;
};

export function PlaceholderSpace({ compact = false }: PlaceholderSpaceProps) {
    return (
        <BluredContainer
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    minHeight: 0,
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}>
                    <Logo textStyle={compact ? "text-title" : "text-giant"}/>
                </BluredContainer>
    );
}