from enum import Enum

class UserEditModelDtoNewRolesItem(str, Enum):
    CLIENT = "CLIENT"
    WORKER = "WORKER"

    def __str__(self) -> str:
        return str(self.value)
