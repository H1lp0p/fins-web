import type { Message } from "@fins/ui-kit";

export type SsoFormContext = "register" | "login";

export function serverReturnedLine(fe: {
  status: number | string;
}): string | undefined {
  if (typeof fe.status === "number") {
    return `Server returned {${fe.status}}`;
  }
  return undefined;
}

function styledLineForField(field: string, context: SsoFormContext): string {
  switch (field) {
    case "name":
      return "Property {Name} doesn't fit requirements";
    case "email":
      return "Property {Email} doesn't fit requirements";
    case "password":
      return context === "register"
        ? 'Property {Pass} should contain matches to regs: "\\w{8,}", "\\d+"'
        : "Property {Pass} doesn't fit requirements";
    case "confirmPassword":
      return "Property {Pass repeat} doesn't match {Pass}";
    default:
      return `Property {${field.charAt(0).toUpperCase()}${field.slice(1)}} doesn't fit requirements`;
  }
}

export function fieldErrorsToStyledMessages(
  fieldErrors: Record<string, string[]>,
  context: SsoFormContext,
): Message[] {
  const list: Message[] = [];
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages.length === 0) continue;
    list.push({
      type: "error",
      title: "ValidationError",
      text: styledLineForField(key, context),
    });
  }
  return list;
}
