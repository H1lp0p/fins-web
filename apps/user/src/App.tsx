import { AmountWithSymbol, BgText, BluredContainer, InlineCheckBox, Input, LinkButton, Logo } from "@fins/ui-kit";
import { useState } from "react";
import { DEFAULT_CHARS } from "@fins/ui-kit";

export default function App() {

  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <main className="bg-background">
      
      <BgText text="Register"/>

        <BluredContainer 
          className="ph-max pv-max gap-mid" 
          style={{ 
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          >
            <Logo textStyle="text-giant"/>
            <LinkButton text="link info" textClassName="text-title" variant="info" onClick={() => {}} />
            <InlineCheckBox content="inline check box" status="checked" onClick={() => {}} />
            <AmountWithSymbol 
              amount={10000.122} 
              symbol={DEFAULT_CHARS.DOLLAR} 
              style={{
                width: "100%",
              }}
              />
            <Input 
            title="Input" 
            placeholder="Test input" 
            value={inputValue} 
            onChange={handleInputChange}
            textClassName="text-info"
            trailingChar={DEFAULT_CHARS.DOLLAR} />
        </BluredContainer>

    </main>
  );
}
