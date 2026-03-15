import { BgText, Header, type Tab } from "@fins/ui-kit";
import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";

export default function App() {
  const tabs: Tab[] = [
    { id: "register", label: "Registration" },
    { id: "login", label: "Login" },
  ];

  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);

  const bgText = activeTab.id === "register" ? "Register" : "Login";

  return (
    <main className="bg-background">
      <BgText text={bgText} />
      <Header
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={setActiveTab}
      />
      {activeTab.id === "register" ? <RegistrationPage /> : <LoginPage />}
    </main>
  );
}
