import {
  ExchangeRateWidget,
} from "@fins/entities";
import { RectSpaceLayout } from "@fins/ui-kit";

export function AdminHomeRectLayout() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <RectSpaceLayout
        topRightContent={<ExchangeRateWidget />}
      />
    </div>
  );
}
