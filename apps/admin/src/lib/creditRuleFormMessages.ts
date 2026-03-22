import type { Message } from "@fins/ui-kit";

/** Стиль подписей как в SSO `fieldErrorsToStyledMessages`. */
function styledLineForField(field: string): string {
  switch (field) {
    case "ruleName":
      return "Property {Name} doesn't fit requirements";
    case "percentage":
      return "Property {Percent} doesn't fit requirements";
    case "collectionPeriodSeconds":
      return "Property {Period} doesn't fit requirements";
    case "percentageStrategy":
      return "Property {Strategy} doesn't fit requirements";
    case "openingDate":
      return "Property {Opening date} doesn't fit requirements";
    default:
      return `Property {${field}} doesn't fit requirements`;
  }
}

export function creditRuleFieldErrorsToMessages(
  fieldErrors: Record<string, string[]>,
): Message[] {
  const list: Message[] = [];
  for (const key of Object.keys(fieldErrors)) {
    list.push({
      type: "error",
      title: "ValidationError",
      text: styledLineForField(key),
    });
  }
  return list;
}
