import type { UserDto } from "../generated/public/generatedPublicApi";

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

export function mapUserFromDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    roles: (dto.roles ?? []) as UserRole[],
    active: dto.active,
  };
}
