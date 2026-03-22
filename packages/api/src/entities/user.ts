import type {
  UserDirectoryEntryDto,
  UserDto,
} from "../generated/public/generatedPublicApi";
import type { CurrencyCode } from "./money";

export type UserRole =
  | "CLIENT"
  | "WORKER"
  | "BLOCKED_CLIENT"
  | "BLOCKED_WORKER";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  active: boolean | undefined;
};

export type TransferDestinationUser = {
  id: string;
  name: string;
  mainAccountCurrency: CurrencyCode;
  email?: string;
};

export function mapUserFromDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    roles: (dto.roles ?? []) as UserRole[],
    active: dto.active,
  };
}

export function mapUserDirectoryEntryFromDto(
  dto: UserDirectoryEntryDto,
): TransferDestinationUser {
  return {
    id: dto.userId,
    name: dto.username,
    mainAccountCurrency: dto.mainAccountCurrency,
  };
}

export function mapUserToTransferDestinationUser(u: User): TransferDestinationUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    mainAccountCurrency: "DOLLAR",
  };
}
