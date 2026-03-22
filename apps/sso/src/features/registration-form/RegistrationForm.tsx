import {
  extractBffError,
  useAuthRegisterMutation,
  validateSsoRegistrationForm,
} from "@fins/api/sso";
import { Input, LinkButton, OnBlurContainer, type Message } from "@fins/ui-kit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useState } from "react";

/** Id формы для `requestSubmit()` с внешней кнопки (`RegistrationSubmitButton`). */
export const SSO_REGISTRATION_FORM_ID = "sso-registration-form";

interface RegistrationFormProps {
  className?: string;
  style?: React.CSSProperties;
}

type FieldKey = "name" | "email" | "password" | "confirmPassword";

const FIELD_LABEL: Record<FieldKey, string> = {
  name: "Ник",
  email: "Email",
  password: "Пароль",
  confirmPassword: "Подтверждение пароля",
};

function allFieldsValid(): Record<FieldKey, boolean> {
  return {
    name: true,
    email: true,
    password: true,
    confirmPassword: true,
  };
}

function fieldErrorsToValidationMessages(
  fieldErrors: Record<string, string[]>,
): Message[] {
  const list: Message[] = [];
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const label = FIELD_LABEL[key as FieldKey] ?? key;
    for (const text of messages) {
      list.push({
        type: "error",
        title: "ValidationError",
        text: `${label}: ${text}`,
      });
    }
  }
  return list;
}

function asFetchBaseQueryError(
  err: unknown,
): FetchBaseQueryError | undefined {
  if (typeof err !== "object" || err === null || !("status" in err)) {
    return undefined;
  }
  return err as FetchBaseQueryError;
}

export function RegistrationForm({ className, style }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldValid, setFieldValid] = useState<Record<FieldKey, boolean>>(
    allFieldsValid,
  );
  const [validationMessages, setValidationMessages] = useState<Message[]>([]);

  const [register] = useAuthRegisterMutation();

  const applyClientValidation = () => {
    const result = validateSsoRegistrationForm({
      name,
      email,
      password,
      confirmPassword,
    });
    if (result.ok) {
      setFieldValid(allFieldsValid());
      setValidationMessages([]);
      return result.value;
    }
    const keys = Object.keys(result.fieldErrors) as FieldKey[];
    setFieldValid({
      name: !keys.includes("name"),
      email: !keys.includes("email"),
      password: !keys.includes("password"),
      confirmPassword: !keys.includes("confirmPassword"),
    });
    setValidationMessages(fieldErrorsToValidationMessages(result.fieldErrors));
    return null;
  };

  const clearFieldInvalid = (key: FieldKey) => {
    setFieldValid((prev) => ({ ...prev, [key]: true }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = applyClientValidation();
    if (body === null) return;

    try {
      await register({ ssoRegisterBody: body }).unwrap();
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFieldValid(allFieldsValid());
      setValidationMessages([]);
    } catch (err) {
      const fe = asFetchBaseQueryError(err);
      if (fe !== undefined) {
        const bff = extractBffError(fe);
        const feMap = bff?.fieldErrors ?? {};
        const keys = Object.keys(feMap) as FieldKey[];
        setFieldValid({
          name: !keys.includes("name"),
          email: !keys.includes("email"),
          password: !keys.includes("password"),
          confirmPassword: !keys.includes("confirmPassword"),
        });
        const fromServer = fieldErrorsToValidationMessages(feMap);
        if (fromServer.length > 0) {
          setValidationMessages(fromServer);
        } else {
          const text =
            bff?.message ?? bff?.code ?? "Не удалось зарегистрироваться";
          setValidationMessages([
            { type: "error", title: "ValidationError", text },
          ]);
        }
      } else {
        setFieldValid(allFieldsValid());
        setValidationMessages([
          {
            type: "error",
            title: "NetworkError",
            text: "Сеть или сервер недоступны",
          },
        ]);
      }
    }
  };

  return (
    <div className={className} style={style}>
      <form
        id={SSO_REGISTRATION_FORM_ID}
        data-validation-messages-count={validationMessages.length}
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "28rem",
        }}
      >
        <Input
          title="Name"
          placeholder="user name example"
          value={name}
          onChange={(v) => {
            setName(v);
            clearFieldInvalid("name");
          }}
          isValid={fieldValid.name}
        />
        <Input
          title="Email"
          placeholder="user.email@example.com"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearFieldInvalid("email");
          }}
          isValid={fieldValid.email}
        />
        <Input
          title="Pass"
          placeholder="req: char[6:]; digit[1:]"
          value={password}
          onChange={(v) => {
            setPassword(v);
            clearFieldInvalid("password");
          }}
          isValid={fieldValid.password}
          type="password"
        />
        <Input
          title="Pass repeat"
          placeholder="req: self.equal({Pass})"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            clearFieldInvalid("confirmPassword");
          }}
          isValid={fieldValid.confirmPassword}
          type="password"
        />
      </form>
    </div>
  );
}

export function RegistrationSubmitButton() {
  const [, { isLoading }] = useAuthRegisterMutation();

  const handleClick = () => {
    if (isLoading) return;
    const form = document.getElementById(SSO_REGISTRATION_FORM_ID);
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }
  };

  return (
    <div
      className="ph-max pv-min"
      style={{ display: "flex", justifyContent: "center", width: "100%" }}
    >
      <OnBlurContainer
        className="pv-mid"
        style={{ display: "flex", justifyContent: "center", width: "100%" }}
      >
        <LinkButton
          text={isLoading ? "Sending…" : "Register"}
          onClick={handleClick}
          variant="info"
          textClassName="text-info"
        />
      </OnBlurContainer>
    </div>
  );
}
