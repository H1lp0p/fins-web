import { BgText } from "../back-ground-text/BgText";
import { LinkButton } from "../link-button/LinkButton";
import { SingleSpaceLayout } from "../../layouts/single-space-layout/SingleSpaceLayout";

export type HttpStatusScreenProps = {
  code: string;
  actionText: string;
  onAction: () => void;
  /** Доп. текст (например при редиректе с состоянием ошибки API). */
  message?: string;
};

export function HttpStatusScreen({
  code,
  actionText,
  onAction,
  message,
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
        <>
          {message !== undefined && message.length > 0 ? (
            <p
              className="text-muted"
              style={{
                margin: 0,
                marginBottom: "1rem",
                textAlign: "center",
                maxWidth: "28rem",
              }}
            >
              {message}
            </p>
          ) : null}
          <LinkButton
            text={actionText}
            onClick={onAction}
            variant="info"
            textClassName="text-info"
          />
        </>
      </SingleSpaceLayout>
    </main>
  );
}
