import type { CurrencyCode } from "@fins/api";
import {
  extractBffError,
  useOpenAccountMutation,
  validateOpenCardAccountForm,
} from "@fins/api";
import {
  DEFAULT_CHARS,
  Input,
  LinkButton,
  LoadingFrameIndicator,
  OnBlurContainer,
  useMessageStack,
} from "@fins/ui-kit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useCallback, useState } from "react";
import {
  openAccountFieldErrorsToMessages,
  serverReturnedLine,
} from "../../lib/userStackMessages";
import styles from "./AccountCreateForm.module.css";

const CURRENCIES: CurrencyCode[] = ["DOLLAR", "EURO", "RUBLE"];

const CURRENCY_CHAR: Record<
  CurrencyCode,
  (typeof DEFAULT_CHARS)[keyof typeof DEFAULT_CHARS]
> = {
  DOLLAR: DEFAULT_CHARS.DOLLAR,
  EURO: DEFAULT_CHARS.EURO,
  RUBLE: DEFAULT_CHARS.RUBLE,
};

type AccountCreateFormProps = {
  userId: string;
  onCreated: (newAccountId?: string) => void;
  onCancel: () => void;
};

type FieldKey = "name" | "currency";

function allFieldsValid(): Record<FieldKey, boolean> {
  return { name: true, currency: true };
}

function asFetchBaseQueryError(
  err: unknown,
): FetchBaseQueryError | undefined {
  if (typeof err !== "object" || err === null || !("status" in err)) {
    return undefined;
  }
  return err as FetchBaseQueryError;
}

export function AccountCreateForm({
  userId,
  onCreated,
  onCancel,
}: AccountCreateFormProps) {
  const [openAccount, { isLoading }] = useOpenAccountMutation();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("RUBLE");
  const [fieldValid, setFieldValid] = useState<Record<FieldKey, boolean>>(
    allFieldsValid,
  );

  const { pushMessage } = useMessageStack();

  const cancel = useCallback(() => {
    setName("");
    setCurrency("RUBLE");
    setFieldValid(allFieldsValid());
    onCancel();
  }, [onCancel]);

  const submit = useCallback(async () => {
    const validated = validateOpenCardAccountForm({ name, currency });
    if (!validated.ok) {
      const keys = Object.keys(validated.fieldErrors) as FieldKey[];
      setFieldValid({
        name: !keys.includes("name"),
        currency: !keys.includes("currency"),
      });
      for (const m of openAccountFieldErrorsToMessages(validated.fieldErrors)) {
        pushMessage(m);
      }
      return;
    }
    setFieldValid(allFieldsValid());
    try {
      const created = await openAccount({
        userId,
        cardAccountCreateModelDto: validated.value,
      }).unwrap();
      setName("");
      setCurrency("RUBLE");
      onCreated(created.id);
    } catch (err) {
      const fe = asFetchBaseQueryError(err);
      if (fe !== undefined) {
        const bff = extractBffError(fe);
        const feMap = bff?.fieldErrors ?? {};
        const keys = Object.keys(feMap) as FieldKey[];
        setFieldValid({
          name: !keys.includes("name"),
          currency: !keys.includes("currency"),
        });
        const fromServer = openAccountFieldErrorsToMessages(feMap);
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
                : "Property {Account} doesn't fit requirements"),
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
  }, [currency, name, onCreated, openAccount, pushMessage, userId]);

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
        <Input
          title="Name"
          value={name}
          onChange={(v) => {
            setName(v);
            setFieldValid((prev) => ({ ...prev, name: true }));
          }}
          isValid={fieldValid.name}
        />

        <div className={`${styles.currenciesContainer} gap-min`}>
          <p className={`text-title color-info ${styles.currencyLabel}`}>
            Currency
          </p>
          <div
            className="gap-min"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            {CURRENCIES.map((code) => (
              <OnBlurContainer
                key={code}
                className="ph-max pv-mid"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LinkButton
                  text={CURRENCY_CHAR[code]}
                  variant={currency === code ? "success" : "info"}
                  textClassName="text-title"
                  onClick={() => {
                    setCurrency(code);
                    setFieldValid((prev) => ({ ...prev, currency: true }));
                  }}
                />
              </OnBlurContainer>
            ))}
          </div>
        </div>
      </div>

      <OnBlurContainer
        className="pv-mid ph-max gap-mid"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LinkButton text="Cancel" variant="info" onClick={cancel} />
        <LinkButton
          text="Create"
          variant="success"
          disabled={isLoading}
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
