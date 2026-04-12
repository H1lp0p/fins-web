import { HttpStatusScreen } from "@fins/ui-kit";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { NavigationBridge } from "./app/NavigationBridge";
import SsoEntry from "./SsoEntry";

function SsoNotFoundPage() {
  const navigate = useNavigate();
  return (
    <HttpStatusScreen
      code="404"
      actionText="goto /index"
      onAction={() => navigate("/", { replace: true })}
    />
  );
}

function SsoForbiddenPage() {
  const navigate = useNavigate();
  return (
    <HttpStatusScreen
      code="403"
      actionText="goto /index"
      onAction={() => navigate("/", { replace: true })}
    />
  );
}

function SsoServerErrorPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const errorMessage = (state as { errorMessage?: string } | null)?.errorMessage;
  return (
    <HttpStatusScreen
      code="500"
      detailText={errorMessage}
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
        <Route path="/" element={<SsoEntry />} />
        <Route path="/403" element={<SsoForbiddenPage />} />
        <Route path="/500" element={<SsoServerErrorPage />} />
        <Route path="*" element={<SsoNotFoundPage />} />
      </Routes>
    </>
  );
}
