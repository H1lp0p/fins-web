from __future__ import annotations
from typing import Any


def _shape_card_account(d: dict[str, Any]) -> dict[str, Any]:
    out = dict(d)
    if "main" not in out and "isMain" in out:
        out["main"] = out.pop("isMain")
    if isinstance(out.get("money"), dict):
        return {k: normalize_public_response(v) for k, v in out.items()}
    m = out.get("money")
    cur = out.pop("currency", None)
    if isinstance(m, (int, float)):
        cc = cur if isinstance(cur, str) else "RUB"
        out["money"] = {"value": m, "currency": cc}
    return {k: normalize_public_response(v) for k, v in out.items()}


def _shape_transaction_operation(d: dict[str, Any]) -> dict[str, Any]:
    out = dict(d)
    acc = out.pop("account", None)
    if isinstance(acc, dict):
        shaped = _shape_card_account(acc)
        aid = shaped.get("id")
        if aid is not None:
            out["cardAccountId"] = aid
    money = out.get("money")
    cur = out.pop("currency", None)
    action = out.pop("action", None)
    if action is not None:
        out["transactionActoin"] = action
    if isinstance(money, (int, float)):
        cc = cur if isinstance(cur, str) else "RUB"
        out["money"] = {"value": money, "currency": cc}
    return {k: normalize_public_response(v) for k, v in out.items()}


def _shape_paged(d: dict[str, Any]) -> dict[str, Any]:
    content = d.get("content")
    out = dict(d)
    if not isinstance(content, list):
        return {k: normalize_public_response(v) for k, v in out.items()}
    if not content:
        out["content"] = []
        return out
    first = content[0]
    if isinstance(first, dict) and "transactionType" in first:
        out["content"] = [normalize_public_response(x) for x in content]
        return out
    if isinstance(first, dict) and "isMain" in first:
        out["content"] = [
            _shape_card_account(x) if isinstance(x, dict) else x for x in content
        ]
        return out
    out["content"] = [normalize_public_response(x) for x in content]
    return out


def normalize_public_response(data: Any) -> Any:
    if isinstance(data, list):
        return [normalize_public_response(x) for x in data]
    if not isinstance(data, dict):
        return data
    d = data
    if (
        "content" in d
        and isinstance(d["content"], list)
        and ("totalPages" in d or "numberOfElements" in d or "totalElements" in d)
    ):
        return _shape_paged(d)
    if "transactionType" in d and "account" in d:
        return _shape_transaction_operation(d)
    if "isMain" in d and "main" not in d and ("content" not in d):
        return _shape_card_account(d)
    return {k: normalize_public_response(v) for k, v in d.items()}
