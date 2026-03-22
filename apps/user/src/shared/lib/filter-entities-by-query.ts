import type {
  CardAccountEntity,
  CreditEntity,
  TransferDestinationUser,
} from "@fins/api";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function filterCardAccountsByQuery(
  accounts: CardAccountEntity[],
  query: string,
): CardAccountEntity[] {
  const q = norm(query);
  if (!q) return accounts;
  return accounts.filter((a) => {
    const name = (a.name ?? "").toLowerCase();
    const id = (a.id ?? "").toLowerCase();
    return name.includes(q) || id.includes(q);
  });
}

export function filterCreditsByQuery(
  credits: CreditEntity[],
  query: string,
): CreditEntity[] {
  const q = norm(query);
  if (!q) return credits;
  return credits.filter((c) => {
    const rule = (c.creditRule?.ruleName ?? "").toLowerCase();
    const id = (c.id ?? "").toLowerCase();
    return rule.includes(q) || id.includes(q);
  });
}

export function filterUsersByQuery(
  users: TransferDestinationUser[],
  query: string,
): TransferDestinationUser[] {
  const q = norm(query);
  if (!q) return users;
  return users.filter((u) => {
    const email = (u.email ?? "").toLowerCase();
    const name = u.name.toLowerCase();
    const id = u.id.toLowerCase();
    return email.includes(q) || name.includes(q) || id.includes(q);
  });
}
