import type { CurrencyCode } from "@fins/api";
import { useOpenAccountMutation, validateOpenCardAccountForm } from "@fins/api";
import { DEFAULT_CHARS, Input, LinkButton, OnBlurContainer } from "@fins/ui-kit";
import { useCallback, useState } from "react";
import styles from "./AccountCreateForm.module.css";

const CURRENCIES: CurrencyCode[] = ["DOLLAR", "EURO", "RUBLE"];

const CURRENCY_CHAR: Record<CurrencyCode, (typeof DEFAULT_CHARS)[keyof typeof DEFAULT_CHARS]> =
  {
    DOLLAR: DEFAULT_CHARS.DOLLAR,
    EURO: DEFAULT_CHARS.EURO,
    RUBLE: DEFAULT_CHARS.RUBLE,
  };

type AccountCreateFormProps = {
  userId: string;
  onCreated: (newAccountId?: string) => void;
  onCancel: () => void;
};

export function AccountCreateForm({
  userId,
  onCreated,
  onCancel,
}: AccountCreateFormProps) {
  const [openAccount, { isLoading }] = useOpenAccountMutation();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("RUBLE");
  const [errorText, setErrorText] = useState<string | null>(null);

  const cancel = useCallback(() => {
    setName("");
    setCurrency("RUBLE");
    setErrorText(null);
    onCancel();
  }, [onCancel]);

  const submit = useCallback(async () => {
    setErrorText(null);
    const validated = validateOpenCardAccountForm({ name, currency });
    if (!validated.ok) {
      const fromFields = Object.values(validated.fieldErrors).flat()[0];
      const fromForm = validated.formErrors?.[0];
      setErrorText(fromFields ?? fromForm ?? "Проверьте поля формы");
      return;
    }
    try {
      const created = await openAccount({
        userId,
        cardAccountCreateModelDto: validated.value,
      }).unwrap();
      setName("");
      setCurrency("RUBLE");
      onCreated(created.id);
    } catch {
      setErrorText("Не удалось открыть счёт");
    }
  }, [currency, name, onCreated, openAccount, userId]);

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
      <div className="gap-min" style={{ display: "flex", flexDirection: "column" }}>
        <Input
          title="Name"
          value={name}
          onChange={setName}
          isValid={errorText == null}
        />

        <div className={`${styles.currenciesContainer} gap-min`}>
          <p className={`text-title color-info ${styles.currencyLabel}`}>Currency</p>
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
                      setErrorText(null);
                    }}
                  />
              </OnBlurContainer>
            ))}
          </div>
        </div>

        {errorText ? (
          <p className="text-info color-error" style={{ margin: 0 }}>
            {errorText}
          </p>
        ) : null}
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
          <span className="text-info color-input-placeholder ph-mid">…</span>
        ) : null}
      </OnBlurContainer>
    </div>
  );
}
