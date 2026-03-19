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
  if (bff?.message) {
    return {
      type: "error",
      title: "RequestError",
      text: bff.message,
    };
  }
  if (bff?.code) {
    return {
      type: "error",
      title: "RequestError",
      text: `Property {${bff.code}} doesn't fit requirements`,
    };
  }
  const line = serverReturnedLine(fe);
  if (line) {
    return { type: "error", title: "RequestError", text: line };
  }
  return {
    type: "error",
    title: "NetworkError",
    text: "Property {Network} doesn't fit requirements",
  };
}

export function forbiddenMessage(): Message {
  return {
    type: "error",
    title: "ForbiddenError",
    text: "Server returned {403}",
  };
}

export function userNotFoundMessage(): Message {
  return {
    type: "error",
    title: "NotFoundError",
    text: "Property {User} doesn't fit requirements",
  };
}

export function invalidUserIdMessage(): Message {
  return {
    type: "error",
    title: "ValidationError",
    text: "Property {userId} doesn't fit requirements",
  };
}

export function editUserFailedMessage(): Message {
  return {
    type: "error",
    title: "ValidationError",
    text: "Property {User.roles} doesn't fit requirements",
  };
}
