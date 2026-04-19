import type { Tab } from "@fins/ui-kit";
import { BgText, Header, HttpStatusScreen } from "@fins/ui-kit";
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

type ServerErrorLocationState = { message?: string };
import { NavigationBridge } from "./app/NavigationBridge";
import { HeaderSessionTray } from "./features/header-session/HeaderSessionTray";
import { RequireSession } from "./features/require-session/RequireSession";
import { CreditPage } from "./pages/CreditPage";
import { HomePage } from "./pages/HomePage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { getSsoOrigin } from "./shared/lib/sso-origin";

const NAV_ITEMS = [
  { id: "index", label: "Index", path: "/" },
  { id: "transactions", label: "Transactions", path: "/transactions" },
  { id: "credit", label: "Credit", path: "/credit" },
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

function MainShell() {
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
    <main className="bg-background" style={{ paddingTop: "4.75rem" }}>
      <Header
        tabs={HEADER_TABS}
        activeTab={activeTab}
        onTabClick={onTabClick}
        trailingContent={<HeaderSessionTray />}
      />
      <Outlet />
    </main>
  );
}

function UserForbiddenPage() {
  return (
    <HttpStatusScreen
      code="403"
      actionText="goto auth"
      onAction={() => {
        window.location.assign(`${getSsoOrigin()}/`);
      }}
    />
  );
}

function UserServerErrorPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const message = (state as ServerErrorLocationState | null)?.message;
  return (
    <HttpStatusScreen
      code="500"
      message={message}
      actionText="goto /index"
      onAction={() => navigate("/", { replace: true })}
    />
  );
}

function UserNotFoundPage() {
  const navigate = useNavigate();
  return (
    <HttpStatusScreen
      code="404"
      actionText="goto /index"
      onAction={() => navigate("/", { replace: true })}
    />
  );
}

export default function App() {
  return (
    <>
      <NavigationBridge />
      <Routes>
        <Route path="/403" element={<UserForbiddenPage />} />
        <Route path="/500" element={<UserServerErrorPage />} />
        <Route path="/" element={<MainShell />}>
          <Route element={<RequireSession />}>
            <Route
              index
              element={
                <>
                  <BgText text="Home" />
                  <HomePage />
                </>
              }
            />
            <Route
              path="transactions"
              element={
                <>
                  <BgText text="Transactions" />
                  <TransactionsPage />
                </>
              }
            />
            <Route
              path="credit"
              element={
                <>
                  <BgText text="Credit" />
                  <CreditPage />
                </>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<UserNotFoundPage />} />
      </Routes>
    </>
  );
}
