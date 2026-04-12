import { useAuthValidateSessionQuery } from "@fins/api/sso";
import {
  BgText,
  Header,
  LoadingFrameIndicator,
  useMessageStack,
  type Tab,
} from "@fins/ui-kit";
import { useState } from "react";
import { SsoAuthenticatedView } from "./features/authenticated-view/SsoAuthenticatedView";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationPage } from "./pages/RegistrationPage";

export default function SsoEntry() {
  const session = useAuthValidateSessionQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { clearMessages } = useMessageStack();

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

  if (session.isLoading) {
    return (
      <main
        className="bg-background"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BgText text="Session" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <LoadingFrameIndicator />
        </div>
      </main>
    );
  }

  if (session.isSuccess) {
    return (
      <main className="bg-background">
        <SsoAuthenticatedView />
      </main>
    );
  }

  return (
    <main className="bg-background">
      <BgText text={bgText} />
      <Header tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
      {activeTab.id === "register" ? <RegistrationPage /> : <LoginPage />}
    </main>
  );
}
