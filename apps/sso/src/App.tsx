import {
  BgText,
  Header,
  MessageStackProvider,
  useMessageStack,
  type Tab,
} from "@fins/ui-kit";
import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";

export default function App() {

  const { pushMessage, clearMessages } = useMessageStack();

  const tabs: Tab[] = [
    { id: "register", label: "Registration" },
    { id: "login", label: "Login" },
  ];

  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    clearMessages();
  };
  
  const bgText = activeTab.id === "register" ? "Register" : "Login";

  return (
    
      <main className="bg-background">
        <BgText text={bgText} />
        <Header
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />
        {activeTab.id === "register" ? <RegistrationPage /> : <LoginPage />}
      </main>
  );
}
