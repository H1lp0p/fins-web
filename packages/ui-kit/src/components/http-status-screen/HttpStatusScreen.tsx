import { BgText } from "../back-ground-text/BgText";
import { LinkButton } from "../link-button/LinkButton";
import { SingleSpaceLayout } from "../../layouts/single-space-layout/SingleSpaceLayout";

export type HttpStatusScreenProps = {
  code: string;
  actionText: string;
  onAction: () => void;
};

export function HttpStatusScreen({
  code,
  actionText,
  onAction,
}: HttpStatusScreenProps) {
  return (
    <main
      className="bg-background"
      style={{
        position: "relative",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <BgText text={code} />
      <SingleSpaceLayout>
        <LinkButton
          text={actionText}
          onClick={onAction}
          variant="info"
          textClassName="text-info"
        />
      </SingleSpaceLayout>
    </main>
  );
}
