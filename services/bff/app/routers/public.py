from __future__ import annotations
from app.config import get_settings

if get_settings().use_upstream:
    from app.routers.public_upstream import router
else:
    from app.routers.public_mock import router
__all__ = ("router",)
