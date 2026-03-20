import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { Message } from "@fins/ui-kit";

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
