import { BluredContainer } from "../blured-container/BluredContainer";
import { Logo } from "../logo/Logo";

export function PlaceholderSpace() {
    return (
        <BluredContainer
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                }}>
                    <Logo textStyle="text-giant"/>
                </BluredContainer>
    );
}