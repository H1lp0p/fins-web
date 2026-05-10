import type {
  CardAccountEntity,
  CreditCreateModelDto,
  CreditRuleEntity,
} from "@fins/api";
import {
  extractBffError,
  useCreateCreditMutation,
  validateCreditCreateForm,
} from "@fins/api";
import {
  ConfirmationModal,
  Input,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
  useMessageStack,
} from "@fins/ui-kit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CardAccountInfo,
  CreditRuleInfo,
  currencyCodeToAmountSymbol,
} from "@fins/entities";
import {
  creditCreateFieldErrorsToMessages,
  serverReturnedLine,
} from "../../lib/userStackMessages";
import styles from "./CreditCreateForm.module.css";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const validatedDraftRef = useRef<CreditCreateModelDto | null>(null);

  const { pushMessage } = useMessageStack();

  useEffect(() => {
    setFieldValid((prev) => ({ ...prev, creditRuleId: true }));
  }, [rule?.id]);

  useEffect(() => {
    setFieldValid((prev) => ({
      ...prev,
      cardAccount: true,
      "money.currency": true,
    }));
  }, [account?.id]);

  const currency = account?.money?.currency;
  const trailing =
    currency != null ? currencyCodeToAmountSymbol(currency) : undefined;

  const confirmContent = useMemo(() => {
    const ruleLabel =
      rule?.ruleName?.trim() ||
      (rule?.id ? `rule#${rule.id.slice(0, 8)}` : "<no_rule>");
    const cur = currency ?? "?";
    return `POST /credit/create: rule="${ruleLabel}" principal=${amount} ${cur}\nProceed?`;
  }, [rule?.ruleName, rule?.id, amount, currency]);

  const handleCreateConfirmed = useCallback(async () => {
    const body = validatedDraftRef.current;
    if (!body) {
      setConfirmOpen(false);
      return;
    }
    setConfirmBusy(true);
    try {
      await createCredit({
        creditCreateModelDto: body,
        idempotencyKey: crypto.randomUUID(),
      }).unwrap();
      validatedDraftRef.current = null;
      setConfirmOpen(false);
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
    } finally {
      setConfirmBusy(false);
    }
  }, [createCredit, onCreated, pushMessage]);

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
    validatedDraftRef.current = validated.value;
    setConfirmOpen(true);
  }, [
    account?.id,
    amount,
    currency,
    pushMessage,
    rule?.id,
    userId,
  ]);

  const ruleSlotInvalid = !fieldValid.creditRuleId;
  const accountSlotInvalid = !fieldValid.cardAccount;
  const amountInvalid =
    !fieldValid["money.value"] || !fieldValid["money.currency"];

  return (
    <div className={`${styles.root} gap-min`}>
      <ConfirmationModal
        open={confirmOpen}
        content={confirmContent}
        confirmLoading={confirmBusy || isLoading}
        onCancel={() => {
          if (confirmBusy || isLoading) return;
          validatedDraftRef.current = null;
          setConfirmOpen(false);
        }}
        onConfirm={() => void handleCreateConfirmed()}
      />
      <div className={`${styles.scroll} ph-mid pv-mid gap-min`}>
        <p className="text-info color-input-placeholder">
          Pick a rule and account in the grid on the right.
        </p>

        <div
          className={`${styles.fieldLine} ${ruleSlotInvalid ? styles.fieldLineInvalid : ""}`}
        >
          <div className={styles.fieldRow}>
            <span className={`text-info color-info ${styles.fieldKey}`}>
              credit_rule
            </span>
            <span className={`text-info color-info ${styles.fieldKey}`}>/</span>
          </div>
          {rule?.id ? (
            <CreditRuleInfo
              rule={rule}
              selected={true}
              style={{ width: "100%" }}
            />
          ) : (
            <span
              className={`text-info color-input-placeholder ${styles.fieldValue}`}
            >
              selected: null
            </span>
          )}
        </div>

        <div
          className={`${styles.fieldLine} ${accountSlotInvalid ? styles.fieldLineInvalid : ""}`}
        >
          <div className={styles.fieldRow}>
            <span className={`text-info color-info ${styles.fieldKey}`}>
              debit_account
            </span>
            <span className={`text-info color-info ${styles.fieldKey}`}>/</span>
          </div>
          {account?.id ? (
            <CardAccountInfo
              account={account}
              selected={true}
              style={{ width: "100%" }}
            />
          ) : (
            <span
              className={`text-info color-input-placeholder ${styles.fieldValue}`}
            >
              selected: null
            </span>
          )}
        </div>

        <div className={`${styles.amountWrap} ${amountInvalid ? styles.amountWrapInvalid : ""}`}>
          <Input
            title="Principal"
            placeholder="e.g. 5000"
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
            isValid={!amountInvalid}
          />
        </div>
      </div>

      <div className={`${styles.footer}`}>
        <OnBlurContainer
          className="pv-mid ph-max"
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <LinkButton
            text="Create credit"
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
    </div>
  );
}
