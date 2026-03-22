import type { CardAccountEntity } from "@fins/api";
import {
  useCloseAccountMutation,
  useSetAccountVisibilityMutation,
  useSetMainAccountMutation,
} from "@fins/api";
import {
  InlineCheckBox,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
  useMessageStack,
  type statusType,
} from "@fins/ui-kit";
import { useNavigate } from "react-router-dom";
import {
  TRANSACTIONS_OUT_SENTINEL_ID,
  buildTransactionsSearchString,
} from "../../shared/lib/transactions-endpoint";

type AccountActionsBarProps = {
  account: CardAccountEntity;
  onClosed?: () => void;
};

export function AccountActionsBar({
  account,
  onClosed,
}: AccountActionsBarProps) {
  const navigate = useNavigate();
  const { pushMessage } = useMessageStack();
  const [setMain, { isLoading: mainLoading }] = useSetMainAccountMutation();
  const [setVis, { isLoading: visLoading }] = useSetAccountVisibilityMutation();
  const [closeAcc, { isLoading: closeLoading }] = useCloseAccountMutation();

  const id = account.id;
  if (!id) return null;

  const isDeleted = account.deleted === true;
  const isMain = account.main === true;
  const visible = account.visible !== false;

  const visStatus: statusType = visLoading
    ? "loading"
    : isDeleted
      ? "denied"
      : visible
        ? "checked"
        : "empty";

  const cannotToggleVisibility = isMain || isDeleted;
  const cannotSetMain = isMain || isDeleted;
  const cannotClose = isMain || isDeleted;

  const enrollSearch = buildTransactionsSearchString({
    to: { type: "Account", id },
  });
  const withdrawSearch = buildTransactionsSearchString({
    from: { type: "User", id },
    to: { type: "Other service", id: TRANSACTIONS_OUT_SENTINEL_ID },
  });

  return (
    <div
      className="ph-mid pv-mid text-info gap-mid"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <OnBlurContainer
        className="ph-mid pv-mid gap-mid"
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          justifyItems: "start",
          alignContent: "start",
          minWidth: 0,
          flexGrow: 1,
          height: "100%",
        }}
      >
        <LinkButton
          text="Enroll"
          variant="success"
          textClassName="text-info-accent"
          onClick={() => navigate(`/transactions${enrollSearch}`)}
        />
        <LinkButton
          text="Withdraw"
          variant="error"
          textClassName="text-info-accent"
          onClick={() => navigate(`/transactions${withdrawSearch}`)}
        />
        <InlineCheckBox
          content="visible"
          status={visStatus}
          textClassName="text-info-accent"
          contentColor="color-info"
          disabled={cannotToggleVisibility}
          onClick={(s) => {
            if (s === "loading" || s === "denied") return;
            void setVis({
              accountId: id,
              accountSetVisibilityDto: { visible: s !== "checked" },
            })
              .unwrap()
              .catch(() => {
                pushMessage({
                  type: "error",
                  title: "Visibility",
                  text: "Не удалось изменить видимость.",
                });
              });
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <LinkButton
            text="Set main"
            variant="success"
            textClassName="text-info-accent"
            disabled={cannotSetMain || mainLoading}
            onClick={() => {
              void setMain({ accountId: id })
                .unwrap()
                .catch(() => {
                  pushMessage({
                    type: "error",
                    title: "Main account",
                    text: "Не удалось назначить главный счёт.",
                  });
                });
            }}
          />
          {mainLoading ? <LoadingFrameIndicator /> : null}
        </div>
      </OnBlurContainer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <LinkButton
          text="Close"
          variant="error"
          textClassName="text-info-accent"
          disabled={cannotClose || closeLoading}
          onClick={() => {
            void closeAcc({ accountId: id })
              .unwrap()
              .then(() => {
                onClosed?.();
              })
              .catch(() => {
                pushMessage({
                  type: "error",
                  title: "Close",
                  text: "Не удалось закрыть счёт.",
                });
              });
          }}
        />
        {closeLoading ? <LoadingFrameIndicator /> : null}
      </div>
    </div>
  );
}
