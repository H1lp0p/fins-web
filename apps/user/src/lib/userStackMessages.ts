import { extractBffError } from "@fins/api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { Message } from "@fins/ui-kit";

export function serverReturnedLine(fe: {
  status: number | string;
}): string | undefined {
  if (typeof fe.status === "number") {
    return `Server returned {${fe.status}}`;
  }
  return undefined;
}

export function messageFromFetchError(fe: FetchBaseQueryError): Message {
  const bff = extractBffError(fe);
  const line = serverReturnedLine(fe);
  if (line) {
    return { type: "error", title: "RequestError", text: line };
  }
  if (bff?.code) {
    return {
      type: "error",
      title: "RequestError",
      text: `Property {${bff.code}} doesn't fit requirements`,
    };
  }
  if (bff?.message) {
    return {
      type: "error",
      title: "RequestError",
      text: bff.message,
    };
  }
  return {
    type: "error",
    title: "NetworkError",
    text: "Property {Network} doesn't fit requirements",
  };
}

export function accountSessionErrorMessage(e: FetchBaseQueryError): Message {
  if (e.status === "FETCH_ERROR") {
    return {
      type: "error",
      title: "NetworkError",
      text: "Property {Network} doesn't fit requirements",
    };
  }
  if (typeof e.status === "number") {
    return {
      type: "error",
      title: "RequestError",
      text: `Server returned {${e.status}}`,
    };
  }
  return {
    type: "error",
    title: "AccountError",
    text: "Property {Account} doesn't fit requirements",
  };
}

type OpenAccountField = "name" | "currency";

function openAccountStyledLine(field: OpenAccountField): string {
  switch (field) {
    case "name":
      return "Property {Name} doesn't fit requirements";
    case "currency":
      return "Property {Currency} doesn't fit requirements";
    default:
      return `Property {${field}} doesn't fit requirements`;
  }
}

export function openAccountFieldErrorsToMessages(
  fieldErrors: Record<string, string[]>,
): Message[] {
  const list: Message[] = [];
  for (const key of Object.keys(fieldErrors) as OpenAccountField[]) {
    const messages = fieldErrors[key];
    if (!messages?.length) continue;
    list.push({
      type: "error",
      title: "ValidationError",
      text: openAccountStyledLine(key),
    });
  }
  return list;
}

type CreditField =
  | "userId"
  | "cardAccount"
  | "creditRuleId"
  | "money.value"
  | "money.currency";

function creditCreateStyledLine(field: string): string {
  switch (field) {
    case "userId":
      return "Property {userId} doesn't fit requirements";
    case "cardAccount":
      return "Property {cardAccount} doesn't fit requirements";
    case "creditRuleId":
      return "Property {creditRuleId} doesn't fit requirements";
    case "money.value":
      return "Property {Amount} doesn't fit requirements";
    case "money.currency":
      return "Property {Currency} doesn't fit requirements";
    default:
      return `Property {${field}} doesn't fit requirements`;
  }
}

export function creditCreateFieldErrorsToMessages(
  fieldErrors: Record<string, string[]>,
): Message[] {
  const list: Message[] = [];
  for (const key of Object.keys(fieldErrors)) {
    const messages = fieldErrors[key];
    if (!messages?.length) continue;
    list.push({
      type: "error",
      title: "ValidationError",
      text: creditCreateStyledLine(key),
    });
  }
  return list;
}
