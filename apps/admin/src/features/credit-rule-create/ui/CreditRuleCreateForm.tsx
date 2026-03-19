import {
  extractBffError,
  useCreateCreditRuleMutation,
  validateCreditRuleForm,
} from "@fins/api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  DEFAULT_CHARS,
  Input,
  LinkButton,
  OnBlurContainer,
  useMessageStack,
  type Message,
} from "@fins/ui-kit";
import { useRef, useState } from "react";
import { messageFromFetchError } from "../../../lib/adminStackMessages";
import { creditRuleFieldErrorsToMessages } from "../../../lib/creditRuleFormMessages";
import {
  nextDurationUnit,
  secondsPerDurationUnit,
  trailingCharForUnit,
  type CreditRuleDurationUnit,
} from "../../../shared/lib/credit-rule-duration";

type FieldKey = "ruleName" | "percentage" | "period";

function allFieldsValid(): Record<FieldKey, boolean> {
  return { ruleName: true, percentage: true, period: true };
}

function asFetchBaseQueryError(
  err: unknown,
): FetchBaseQueryError | undefined {
  if (typeof err !== "object" || err === null || !("status" in err)) {
    return undefined;
  }
  return err as FetchBaseQueryError;
}

function applyFieldErrorsToValidity(
  fieldErrors: Record<string, string[]>,
): Record<FieldKey, boolean> {
  const keys = Object.keys(fieldErrors);
  return {
    ruleName: !keys.includes("ruleName"),
    percentage: !keys.includes("percentage"),
    period: !keys.includes("collectionPeriodSeconds"),
  };
}

export type CreditRuleCreateFormProps = {
  onCreated?: () => void;
};

export function CreditRuleCreateForm({ onCreated }: CreditRuleCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [ruleName, setRuleName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [period, setPeriod] = useState("");
  const [durationUnit, setDurationUnit] =
    useState<CreditRuleDurationUnit>("seconds");

  const [fieldValid, setFieldValid] =
    useState<Record<FieldKey, boolean>>(allFieldsValid);

  const { pushMessage } = useMessageStack();
  const [createRule, { isLoading }] = useCreateCreditRuleMutation();

  const pushMessages = (messages: Message[]) => {
    for (const m of messages) {
      pushMessage(m);
    }
  };

  const clearFieldInvalid = (key: FieldKey) => {
    setFieldValid((prev) => ({ ...prev, [key]: true }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const manualErrors: Record<string, string[]> = {};
    const pctTrim = percentage.trim();
    const periodTrim = period.trim();

    if (pctTrim.length === 0) {
      manualErrors.percentage = ["required"];
    }
    if (periodTrim.length === 0) {
      manualErrors.collectionPeriodSeconds = ["required"];
    }

    let collectionPeriodSeconds: number | undefined;
    if (periodTrim.length > 0) {
      const n = Number(periodTrim);
      if (!Number.isFinite(n) || n <= 0) {
        manualErrors.collectionPeriodSeconds = ["invalid"];
      } else {
        const mult = secondsPerDurationUnit(durationUnit);
        const rounded = Math.round(n * mult);
        if (rounded < 1) {
          manualErrors.collectionPeriodSeconds = ["invalid"];
        } else {
          collectionPeriodSeconds = rounded;
        }
      }
    }

    if (Object.keys(manualErrors).length > 0) {
      setFieldValid(applyFieldErrorsToValidity(manualErrors));
      pushMessages(creditRuleFieldErrorsToMessages(manualErrors));
      return;
    }

    const validated = validateCreditRuleForm({
      ruleName,
      percentage: pctTrim,
      collectionPeriodSeconds,
    });

    if (!validated.ok) {
      setFieldValid(applyFieldErrorsToValidity(validated.fieldErrors));
      pushMessages(creditRuleFieldErrorsToMessages(validated.fieldErrors));
      return;
    }

    const creditRuleDto = {
      ...validated.value,
      percentageStrategy: "FROM_REMAINING_DEBT" as const,
    };

    try {
      await createRule({ creditRuleDto }).unwrap();
      setRuleName("");
      setPercentage("");
      setPeriod("");
      setDurationUnit("seconds");
      setFieldValid(allFieldsValid());
      onCreated?.();
    } catch (err) {
      const fe = asFetchBaseQueryError(err);
      if (fe !== undefined) {
        const bff = extractBffError(fe);
        const feMap = bff?.fieldErrors ?? {};
        const keys = Object.keys(feMap);
        if (keys.length > 0) {
          setFieldValid(applyFieldErrorsToValidity(feMap));
          pushMessages(creditRuleFieldErrorsToMessages(feMap));
        } else {
          setFieldValid(allFieldsValid());
          pushMessage(messageFromFetchError(fe));
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
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="ph-mid pv-mid"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <div 
        className="gap-mid" 
        style={{ 
          display: "flex", 
          flexDirection: "column"
        }}
      >

        <Input
          title="Name"
          placeholder="New credit rule"
          value={ruleName}
          onChange={(v) => {
            setRuleName(v);
            clearFieldInvalid("ruleName");
          }}
          isValid={fieldValid.ruleName}
        />
        <Input
          title="Percent"
          placeholder="12.05"
          value={percentage}
          onChange={(v) => {
            setPercentage(v);
            clearFieldInvalid("percentage");
          }}
          isValid={fieldValid.percentage}
          trailingChar={DEFAULT_CHARS.PERCENT}
        />
        <div
          className="text-info color-info"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <span className="text-info-accent color-info">Duration in</span>
          <LinkButton
            text={durationUnit}
            onClick={() => {
              setDurationUnit((u) => nextDurationUnit(u));
              clearFieldInvalid("period");
            }}
            variant="success"
            textClassName="text-title"
          />
        </div>
        <Input
          title="Period"
          placeholder="12"
          value={period}
          onChange={(v) => {
            setPeriod(v);
            clearFieldInvalid("period");
          }}
          isValid={fieldValid.period}
          trailingChar={trailingCharForUnit(durationUnit)}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <OnBlurContainer
          className="pv-mid ph-max"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <LinkButton
            text="Create"
            onClick={() => {
              if (isLoading) return;
              formRef.current?.requestSubmit();
            }}
            variant="info"
            textClassName="text-title"
            loading={isLoading}
            disabled={isLoading}
          />
        </OnBlurContainer>
      </div>
    </form>
  );
}
