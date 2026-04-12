from __future__ import annotations
from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class BffUser:
    id: UUID
    roles: frozenset[str]

    def is_worker(self) -> bool:
        return "WORKER" in self.roles
