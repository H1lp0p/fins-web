import type { Tab } from "@fins/ui-kit";
import { BgText, Header } from "@fins/ui-kit";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { HeaderSessionTray } from "./features/header-session/HeaderSessionTray";
import { CreditPage } from "./pages/CreditPage";
import { HomePage } from "./pages/HomePage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { UiPreviewPage } from "./pages/UiPreviewPage";

const NAV_ITEMS = [
  { id: "index", label: "Index", path: "/" },
  { id: "transactions", label: "Transactions", path: "/transactions" },
  { id: "credit", label: "Credit", path: "/credit" },
  { id: "preview", label: "Preview", path: "/preview" },
] as const;

const HEADER_TABS: Tab[] = NAV_ITEMS.map(({ id, label, path }) => ({
  id,
  label,
  href: path,
}));

function pathnameToTabId(pathname: string): Tab["id"] {
  const p =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const match = NAV_ITEMS.find((item) => item.path === p);
  return match?.id ?? "index";
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeId = pathnameToTabId(location.pathname);
  const activeNav =
    NAV_ITEMS.find((t) => t.id === activeId) ?? NAV_ITEMS[0];
  const activeTab: Tab = {
    id: activeNav.id,
    label: activeNav.label,
  };

  const onTabClick = (tab: Tab) => {
    const item = NAV_ITEMS.find((t) => t.id === tab.id);
    if (item) navigate(item.path);
  };

  return (
    <main className="bg-background" style={{ paddingTop: "4.75rem" }}>
      <Header
        tabs={HEADER_TABS}
        activeTab={activeTab}
        onTabClick={onTabClick}
        trailingContent={<HeaderSessionTray />}
      />
      <Routes>
        <Route path="/preview" element={
          <>
            <BgText text="Preview" />
            <UiPreviewPage />
          </>
          } />
        <Route path="/" element={
          <>
            <BgText text="Home" />
            <HomePage />
          </>
          } />
        <Route path="/transactions" element={
          <>
            <BgText text="Transactions" />
            <TransactionsPage />
          </>
          } />
        <Route path="/credit" element={
          <>
            <BgText text="Credit" />
            <CreditPage />
          </>
          } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
