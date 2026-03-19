import type { Tab } from "@fins/ui-kit";
import { Header } from "@fins/ui-kit";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { HeaderSessionTray } from "./features/header-session/HeaderSessionTray";
import { RequireSession } from "./features/require-session/RequireSession";
import { AdminHomePage } from "./pages/AdminHomePage";
import { CreditsPage } from "./pages/CreditsPage";
import { UsersPage } from "./pages/UsersPage";

const NAV_ITEMS = [
  { id: "index", label: "Index", path: "/" },
  { id: "users", label: "Users", path: "/users" },
  { id: "credits", label: "Credits", path: "/credits" },
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
  const activeNav = NAV_ITEMS.find((t) => t.id === activeId) ?? NAV_ITEMS[0];
  const activeTab: Tab = {
    id: activeNav.id,
    label: activeNav.label,
  };

  const onTabClick = (tab: Tab) => {
    const item = NAV_ITEMS.find((t) => t.id === tab.id);
    if (item) navigate(item.path);
  };

  return (
    <div
      className="bg-background"
      style={{ height: "100%", overflow: "hidden", boxSizing: "border-box" }}
    >
      <Header
        tabs={HEADER_TABS}
        activeTab={activeTab}
        onTabClick={onTabClick}
        trailingContent={<HeaderSessionTray />}
      />
      <div
        style={{
          marginTop: "4.75rem",
          height: "calc(100% - 4.75rem)",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <RequireSession>
          <Routes>
            <Route path="/" element={<AdminHomePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RequireSession>
      </div>
    </div>
  );
}
