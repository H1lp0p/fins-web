import { AmountWithSymbol, BgText, BluredContainer, Header, InlineCheckBox, Input, LinkButton, Logo, OnBlurContainer, SingleSpaceLayout, TabList, type Tab } from "@fins/ui-kit";
import { useState } from "react";
import { DEFAULT_CHARS } from "@fins/ui-kit";

export default function App() {

  const [inputValue, setInputValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("1");

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };


  const tabs = [
    { id: "1", label: "Index" },
    { id: "2", label: "Transactions" },
    { id: "3", label: "Loans" },
  ];

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
  };
  
  const activeTabData = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <main className="bg-background">
      <Header 
        tabs={tabs} 
        activeTab={activeTabData} 
        onTabClick={handleTabClick} 
        trailingContent={
          <span className="text-title color-info" style={{ textAlign: "right" }}>Test trailing content</span>
        }
      />
      
      <BgText text="Register"/>

        <SingleSpaceLayout>
          {/* <div className="ph-mid pv-max gap-mid" style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}>
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
          </div>
          <OnBlurContainer className="ph-mid pv-mid gap-min" style={{width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <LinkButton text="link info" textClassName="text-title" variant="info" onClick={() => {}} />
          </OnBlurContainer> */}
        </SingleSpaceLayout>

        
    </main>
  );
}
