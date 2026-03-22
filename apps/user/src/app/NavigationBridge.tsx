import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAppNavigate } from "./navigationRef";

export function NavigationBridge() {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    setAppNavigate(navigate);
    return () => setAppNavigate(null);
  }, [navigate]);
  return null;
}
