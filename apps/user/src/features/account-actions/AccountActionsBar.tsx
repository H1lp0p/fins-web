import type { CardAccountEntity } from "@fins/api";
import {
  useCloseAccountMutation,
  useGetPreferencesQuery,
  useSetMainAccountMutation,
  useUpdatePreferencesMutation,
} from "@fins/api";
import {
  ConfirmationModal,
  InlineCheckBox,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
  useMessageStack,
  type statusType,
} from "@fins/ui-kit";
import { useCallback, useRef, useState } from "react";
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
  const [updatePrefs, { isLoading: prefMutating }] =
    useUpdatePreferencesMutation();
  const [closeAcc, { isLoading: closeLoading }] = useCloseAccountMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmBusy, setConfirmBusy] = useState(false);
  const pendingWithKeyRef = useRef<((key: string) => Promise<void>) | null>(
    null,
  );

  const requestConfirm = useCallback(
    (text: string, runWithKey: (key: string) => Promise<void>) => {
      pendingWithKeyRef.current = runWithKey;
      setConfirmText(text);
      setConfirmOpen(true);
    },
    [],
  );

  const handleConfirmDismiss = useCallback(() => {
    if (confirmBusy) return;
    pendingWithKeyRef.current = null;
    setConfirmOpen(false);
  }, [confirmBusy]);

  const handleConfirmAccept = useCallback(async () => {
    const fn = pendingWithKeyRef.current;
    if (!fn) return;
    const key = crypto.randomUUID();
    setConfirmBusy(true);
    try {
      await fn(key);
      pendingWithKeyRef.current = null;
      setConfirmOpen(false);
    } finally {
      setConfirmBusy(false);
    }
  }, []);

  const id = account.id;
  const {
    data: prefs,
    isLoading: prefsLoading,
    isFetching: prefsFetching,
  } = useGetPreferencesQuery(undefined, { skip: !id });

  if (!id) return null;

  const isDeleted = account.deleted === true;
  const isMain = account.main === true;
  const visible = account.visible !== false;

  const prefsPending = prefsLoading || prefsFetching;
  const visStatus: statusType = prefMutating || prefsPending
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
    <>
      <ConfirmationModal
        open={confirmOpen}
        content={confirmText}
        confirmLoading={confirmBusy}
        onCancel={handleConfirmDismiss}
        onConfirm={() => void handleConfirmAccept()}
      />
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
          disabled={cannotToggleVisibility || prefsPending || prefMutating}
          onClick={(s) => {
            if (s === "loading" || s === "denied") return;
            const nextVisible = s !== "checked";
            const hidden = new Set(prefs?.hiddenAccounts ?? []);
            if (nextVisible) hidden.delete(id);
            else hidden.add(id);
            const dto = {
              theme: prefs?.theme ?? "light",
              hiddenAccounts: [...hidden],
            };
            requestConfirm(
              nextVisible
                ? "PUT /preferences: hidden_accounts.remove(id) → show in UI list\nProceed?"
                : "PUT /preferences: hidden_accounts.add(id) → hide from UI list\nProceed?",
              async (key) => {
                try {
                  await updatePrefs({
                    userPreferencesDto: dto,
                    idempotencyKey: key,
                  }).unwrap();
                } catch {
                  pushMessage({
                    type: "error",
                    title: "Visibility",
                    text: "Не удалось изменить видимость.",
                  });
                }
              },
            );
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
              requestConfirm(
                "POST /cardaccount/{id}/set-main: elevate to PRIMARY wallet\nProceed?",
                async (key) => {
                  try {
                    await setMain({
                      accountId: id,
                      idempotencyKey: key,
                    }).unwrap();
                  } catch {
                    pushMessage({
                      type: "error",
                      title: "Main account",
                      text: "Не удалось назначить главный счёт.",
                    });
                  }
                },
              );
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
            requestConfirm(
              "POST /cardaccount/close/{id}: WARN—not reversible via this UI\nProceed?",
              async (key) => {
                try {
                  await closeAcc({ accountId: id, idempotencyKey: key }).unwrap();
                  onClosed?.();
                } catch {
                  pushMessage({
                    type: "error",
                    title: "Close",
                    text: "Не удалось закрыть счёт.",
                  });
                }
              },
            );
          }}
        />
        {closeLoading ? <LoadingFrameIndicator /> : null}
      </div>
    </div>
    </>
  );
}
