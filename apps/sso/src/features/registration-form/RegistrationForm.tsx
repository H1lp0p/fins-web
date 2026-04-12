import {
  extractBffError,
  useAuthRegisterMutation,
  validateSsoRegistrationForm,
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

export const SSO_REGISTRATION_FORM_ID = "sso-registration-form";

interface RegistrationFormProps {
  className?: string;
  style?: React.CSSProperties;
}

type FieldKey = "name" | "email" | "password" | "confirmPassword";

function allFieldsValid(): Record<FieldKey, boolean> {
  return {
    name: true,
    email: true,
    password: true,
    confirmPassword: true,
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

export function RegistrationForm({ className, style }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldValid, setFieldValid] = useState<Record<FieldKey, boolean>>(
    allFieldsValid,
  );

  const { pushMessage } = useMessageStack();
  const [register] = useAuthRegisterMutation();

  const pushMessages = (messages: Message[]) => {
    for (const m of messages) {
      pushMessage(m);
    }
  };

  const applyClientValidation = () => {
    const result = validateSsoRegistrationForm({
      name,
      email,
      password,
      confirmPassword,
    });
    if (result.ok) {
      setFieldValid(allFieldsValid());
      return result.value;
    }
    const keys = Object.keys(result.fieldErrors) as FieldKey[];
    setFieldValid({
      name: !keys.includes("name"),
      email: !keys.includes("email"),
      password: !keys.includes("password"),
      confirmPassword: !keys.includes("confirmPassword"),
    });
    pushMessages(fieldErrorsToStyledMessages(result.fieldErrors, "register"));
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
        const fromServer = fieldErrorsToStyledMessages(feMap, "register");
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
              "Property {Register} doesn't fit requirements",
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
        id={SSO_REGISTRATION_FORM_ID}
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
