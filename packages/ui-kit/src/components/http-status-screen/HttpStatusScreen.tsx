import { BgText } from "../back-ground-text/BgText";
import { LinkButton } from "../link-button/LinkButton";
import { SingleSpaceLayout } from "../../layouts/single-space-layout/SingleSpaceLayout";

export type HttpStatusScreenProps = {
  code: string;
  actionText: string;
  onAction: () => void;
  /** Текст ошибки (например от сервера), отдельно от кнопки навигации */
  detailText?: string;
};

export function HttpStatusScreen({
  code,
  actionText,
  onAction,
  detailText,
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            maxWidth: "36rem",
            textAlign: "center",
          }}
        >
          {detailText ? (
            <>
              <span className="text-info color-info">
                  ErrorMessage:
              </span>
              <span className="text-info color-error" style={{ lineHeight: 1.45 }}>
                "{detailText}"
              </span>
            </>
          ) : null}
          <LinkButton
            text={actionText}
            onClick={onAction}
            variant="info"
            textClassName="text-info"
          />
        </div>
      </SingleSpaceLayout>
    </main>
  );
}
