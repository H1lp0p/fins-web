import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { UiPreviewPage } from "./pages/UiPreviewPage";

export default function App() {
  return (
    <Routes>
      <Route path="/preview" element={<UiPreviewPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
