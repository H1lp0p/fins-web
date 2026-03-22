from enum import Enum

class UserDtoRolesItem(str, Enum):
    BLOCKED_CLIENT = "BLOCKED_CLIENT"
    BLOCKED_WORKER = "BLOCKED_WORKER"
    CLIENT = "CLIENT"
    WORKER = "WORKER"

    def __str__(self) -> str:
        return str(self.value)
