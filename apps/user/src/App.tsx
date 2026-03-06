import { BluredContainer, InlineCheckBox, LinkButton } from "@fins/ui-kit";

export default function App() {
  return (
    <main className="bg-background">
      <p 
      className="text-absolute color-success"
      style={{
        margin: "0",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 0,
        textAlign: "center",
        }}>
        Page
      </p>

        <BluredContainer style={{ 
          width: "300px", 
          height: "300px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          }}>
          <span className="text-title color-info">Test text</span>
          <LinkButton text="link info" textClassName="text-title" variant="info" onClick={() => {}} />
          <LinkButton text="link success" textClassName="text-info-accent" variant="success" onClick={() => {}} />
          <LinkButton text="link error" textClassName="text-info" variant="error" onClick={() => {}} />
          <InlineCheckBox content="inline check box" status="loading" onClick={() => {}} />
        </BluredContainer>

    </main>
  );
}
