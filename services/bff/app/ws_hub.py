from __future__ import annotations
import asyncio
import json
from collections import defaultdict
from uuid import UUID
from fastapi import WebSocket
from generated.bff_browser_models import TransactionOperation


class TransactionsWsHub:
    def __init__(self) -> None:
        self._subs: dict[UUID, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def register(self, account_id: UUID, ws: WebSocket) -> None:
        async with self._lock:
            self._subs[account_id].add(ws)

    async def unregister(self, account_id: UUID, ws: WebSocket) -> None:
        async with self._lock:
            subs = self._subs.get(account_id)
            if subs and ws in subs:
                subs.discard(ws)
                if not subs:
                    del self._subs[account_id]

    async def broadcast_transaction(
        self, account_id: UUID, operation: TransactionOperation
    ) -> None:
        payload = {
            "type": "transaction",
            "accountId": str(account_id),
            "operation": operation.model_dump(mode="json"),
        }
        text = json.dumps(payload, default=str)
        async with self._lock:
            sockets = list(self._subs.get(account_id, ()))
        for s in sockets:
            try:
                await s.send_text(text)
            except Exception:
                await self.unregister(account_id, s)


ws_hub = TransactionsWsHub()
