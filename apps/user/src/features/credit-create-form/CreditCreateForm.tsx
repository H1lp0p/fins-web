import type { CardAccountEntity, CreditRuleEntity } from "@fins/api";
import {
  extractBffError,
  useCreateCreditMutation,
  validateCreditCreateForm,
} from "@fins/api";
import {
  Input,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
  useMessageStack,
} from "@fins/ui-kit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useCallback, useState } from "react";
import {
  CardAccountInfo,
  CreditRuleInfo,
  currencyCodeToAmountSymbol,
} from "@fins/entities";
import {
  creditCreateFieldErrorsToMessages,
  serverReturnedLine,
} from "../../lib/userStackMessages";

type CreditCreateFormProps = {
  userId: string;
  rule: CreditRuleEntity | null;
  account: CardAccountEntity | null;
  amount: string;
  onAmountChange: (value: string) => void;
  onCreated: () => void;
};

type FieldKey =
  | "userId"
  | "cardAccount"
  | "creditRuleId"
  | "money.value"
  | "money.currency";

function allFieldsValid(): Record<FieldKey, boolean> {
  return {
    userId: true,
    cardAccount: true,
    creditRuleId: true,
    "money.value": true,
    "money.currency": true,
  };
}

function asFetchBaseQueryError(
  err: unknown,
): FetchBaseQueryError | undefined {
  if (typeof err !== "object" || err === null || !("status" in err)) {
    return undefined;
  }
  return err as FetchBaseQueryError;
}

export function CreditCreateForm({
  userId,
  rule,
  account,
  amount,
  onAmountChange,
  onCreated,
}: CreditCreateFormProps) {
  const [createCredit, { isLoading }] = useCreateCreditMutation();
  const [fieldValid, setFieldValid] = useState<Record<FieldKey, boolean>>(
    allFieldsValid,
  );

  const { pushMessage } = useMessageStack();

  const currency = account?.money?.currency;
  const trailing =
    currency != null ? currencyCodeToAmountSymbol(currency) : undefined;

  const submit = useCallback(async () => {
    const validated = validateCreditCreateForm({
      userId,
      cardAccount: account?.id,
      creditRuleId: rule?.id,
      moneyValue: amount,
      moneyCurrency: currency,
    });
    if (!validated.ok) {
      const keys = Object.keys(validated.fieldErrors) as FieldKey[];
      setFieldValid({
        userId: !keys.includes("userId"),
        cardAccount: !keys.includes("cardAccount"),
        creditRuleId: !keys.includes("creditRuleId"),
        "money.value": !keys.includes("money.value"),
        "money.currency": !keys.includes("money.currency"),
      });
      for (const m of creditCreateFieldErrorsToMessages(
        validated.fieldErrors,
      )) {
        pushMessage(m);
      }
      return;
    }
    setFieldValid(allFieldsValid());
    try {
      await createCredit({ creditCreateModelDto: validated.value }).unwrap();
      onCreated();
    } catch (err) {
      const fe = asFetchBaseQueryError(err);
      if (fe !== undefined) {
        const bff = extractBffError(fe);
        const feMap = bff?.fieldErrors ?? {};
        const keys = Object.keys(feMap) as FieldKey[];
        setFieldValid({
          userId: !keys.includes("userId"),
          cardAccount: !keys.includes("cardAccount"),
          creditRuleId: !keys.includes("creditRuleId"),
          "money.value": !keys.includes("money.value"),
          "money.currency": !keys.includes("money.currency"),
        });
        const fromServer = creditCreateFieldErrorsToMessages(feMap);
        if (fromServer.length > 0) {
          for (const m of fromServer) pushMessage(m);
        } else {
          pushMessage({
            type: "error",
            title: "RequestError",
            text:
              bff?.message ??
              serverReturnedLine(fe) ??
              (bff?.code
                ? `Property {${bff.code}} doesn't fit requirements`
                : "Property {Credit} doesn't fit requirements"),
          });
        }
      } else {
        setFieldValid(allFieldsValid());
        pushMessage({
          type: "error",
          title: "NetworkError",
          text: "Property {Network} doesn't fit requirements",
        });
      }
    }
  }, [
    account?.id,
    amount,
    createCredit,
    currency,
    onCreated,
    pushMessage,
    rule?.id,
    userId,
  ]);

  const amountValid = fieldValid["money.value"] && fieldValid["money.currency"];

  return (
    <div
      className="ph-mid pv-mid gap-mid"
      style={{
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        className="gap-min"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {rule ? (
          <CreditRuleInfo
            rule={rule}
            selected={true}
            style={{ width: "100%" }}
          />
        ) : null}
        {account ? (
          <CardAccountInfo
            account={account}
            selected={true}
            style={{ width: "100%" }}
          />
        ) : (
          <p className="text-info color-input-placeholder">
            Выберите счёт справа
          </p>
        )}

        <Input
          title="Amount"
          value={amount}
          onChange={(v) => {
            onAmountChange(v);
            setFieldValid((prev) => ({
              ...prev,
              "money.value": true,
              "money.currency": true,
            }));
          }}
          trailingChar={trailing}
          isValid={amountValid}
        />
      </div>

      <OnBlurContainer
        className="pv-mid ph-max"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <LinkButton
          text="Create"
          variant="success"
          onClick={() => void submit()}
        />
        {isLoading ? (
          <div className="ph-mid" style={{ display: "flex", justifyContent: "center" }}>
            <LoadingFrameIndicator />
          </div>
        ) : null}
      </OnBlurContainer>
    </div>
  );
}
