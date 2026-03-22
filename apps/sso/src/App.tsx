import { HttpStatusScreen } from "@fins/ui-kit";
import { Route, Routes, useNavigate } from "react-router-dom";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SsoEntry />} />
      <Route path="*" element={<SsoNotFoundPage />} />
    </Routes>
  );
}
