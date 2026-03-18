import type { CardAccountEntity, CreditRuleEntity } from "@fins/api";
import {
  useCreateCreditMutation,
  validateCreditCreateForm,
} from "@fins/api";
import { Input, LinkButton, OnBlurContainer } from "@fins/ui-kit";
import { useCallback, useState } from "react";
import { CardAccountInfo } from "../../entities/card-account";
import { CreditRuleInfo } from "../../entities/credit-rule";
import { currencyCodeToAmountSymbol } from "../../shared/lib/currency-symbol";

type CreditCreateFormProps = {
  userId: string;
  rule: CreditRuleEntity | null;
  account: CardAccountEntity | null;
  amount: string;
  onAmountChange: (value: string) => void;
  onCreated: () => void;
};

export function CreditCreateForm({
  userId,
  rule,
  account,
  amount,
  onAmountChange,
  onCreated,
}: CreditCreateFormProps) {
  const [createCredit, { isLoading }] = useCreateCreditMutation();
  const [errorText, setErrorText] = useState<string | null>(null);

  const currency = account?.money?.currency;
  const trailing =
    currency != null ? currencyCodeToAmountSymbol(currency) : undefined;

  const submit = useCallback(async () => {
    setErrorText(null);
    const validated = validateCreditCreateForm({
      userId,
      cardAccount: account?.id,
      creditRuleId: rule?.id,
      moneyValue: amount,
      moneyCurrency: currency,
    });
    if (!validated.ok) {
      const fromFields = Object.values(validated.fieldErrors).flat()[0];
      const fromForm = validated.formErrors?.[0];
      setErrorText(fromFields ?? fromForm ?? "Проверьте поля формы");
      return;
    }
    try {
      await createCredit({ creditCreateModelDto: validated.value }).unwrap();
      onCreated();
    } catch {
      setErrorText("Не удалось создать кредит");
    }
  }, [
    account?.id,
    amount,
    createCredit,
    currency,
    onCreated,
    rule?.id,
    userId,
  ]);

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
      <div className="gap-min" style={{ display: "flex", flexDirection: "column"}}>
        
        {rule ? <CreditRuleInfo rule={rule} selected={true} style={{ width: "100%" }}/> : null}
        {account ? (
          <CardAccountInfo account={account} selected={true} style={{ width: "100%" }} />
        ) : (
          <p className="text-info color-input-placeholder">
            Выберите счёт справа
          </p>
        )}

        <Input
          title="Amount"
          value={amount}
          onChange={onAmountChange}
          trailingChar={trailing}
          isValid={errorText == null}
        />

        {errorText ? (
          <p className="text-info color-error" style={{ margin: 0 }}>
            {errorText}
          </p>
        ) : null}
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
          <span className="text-info color-input-placeholder ph-mid">
            …
          </span>
        ) : null}
      </OnBlurContainer>
    </div>
  );
}
