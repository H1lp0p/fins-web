import {
  extractBffError,
  useAuthLoginMutation,
  validateSsoLoginForm,
} from "@fins/api/sso";
import {
  Input,
  LinkButton,
  OnBlurContainer,
  useMessageStack,
  type Message,
} from "@fins/ui-kit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useState } from "react";
import {
  fieldErrorsToStyledMessages,
  serverReturnedLine,
} from "../../lib/ssoValidationMessages";

export const SSO_LOGIN_FORM_ID = "sso-login-form";

interface LoginFormProps {
  className?: string;
  style?: React.CSSProperties;
}

type FieldKey = "email" | "password";

function allFieldsValid(): Record<FieldKey, boolean> {
  return { email: true, password: true };
}

function asFetchBaseQueryError(
  err: unknown,
): FetchBaseQueryError | undefined {
  if (typeof err !== "object" || err === null || !("status" in err)) {
    return undefined;
  }
  return err as FetchBaseQueryError;
}

export function LoginForm({ className, style }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldValid, setFieldValid] = useState<Record<FieldKey, boolean>>(
    allFieldsValid,
  );

  const { pushMessage } = useMessageStack();
  const [login] = useAuthLoginMutation();

  const pushMessages = (messages: Message[]) => {
    for (const m of messages) {
      pushMessage(m);
    }
  };

  const applyClientValidation = () => {
    const result = validateSsoLoginForm({ email, password });
    if (result.ok) {
      setFieldValid(allFieldsValid());
      return result.value;
    }
    const keys = Object.keys(result.fieldErrors) as FieldKey[];
    setFieldValid({
      email: !keys.includes("email"),
      password: !keys.includes("password"),
    });
    pushMessages(fieldErrorsToStyledMessages(result.fieldErrors, "login"));
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
      await login({ ssoLoginBody: body }).unwrap();
      setEmail("");
      setPassword("");
      setFieldValid(allFieldsValid());
    } catch (err) {
      const fe = asFetchBaseQueryError(err);
      if (fe !== undefined) {
        const bff = extractBffError(fe);
        const feMap = bff?.fieldErrors ?? {};
        const keys = Object.keys(feMap) as FieldKey[];
        setFieldValid({
          email: !keys.includes("email"),
          password: !keys.includes("password"),
        });
        const fromServer = fieldErrorsToStyledMessages(feMap, "login");
        if (fromServer.length > 0) {
          pushMessages(fromServer);
        } else {
          pushMessage({
            type: "error",
            title: "ValidationError",
            text:
              bff?.message ??
              serverReturnedLine(fe) ??
              bff?.code ??
              "Property {Login} doesn't fit requirements",
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
  };

  return (
    <div className={className} style={style}>
      <form
        id={SSO_LOGIN_FORM_ID}
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "28rem",
        }}
      >
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
          placeholder="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            clearFieldInvalid("password");
          }}
          isValid={fieldValid.password}
          type="password"
        />
      </form>
    </div>
  );
}

export function LoginSubmitButton() {
  const [, { isLoading }] = useAuthLoginMutation();

  const handleClick = () => {
    if (isLoading) return;
    const form = document.getElementById(SSO_LOGIN_FORM_ID);
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
          text={isLoading ? "Sending…" : "Login"}
          onClick={handleClick}
          variant="info"
          textClassName="text-info"
        />
      </OnBlurContainer>
    </div>
  );
}
