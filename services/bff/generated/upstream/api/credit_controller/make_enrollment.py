from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.credit_answer_dto import CreditAnswerDTO
from typing import cast
from uuid import UUID



def _get_kwargs(
    card_account_id: UUID,
    *,
    money: float,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["money"] = money


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/credit-service/credit/{card_account_id}/enrollment".format(card_account_id=quote(str(card_account_id), safe=""),),
        "params": params,
    }


    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> CreditAnswerDTO | None:
    if response.status_code == 200:
        response_200 = CreditAnswerDTO.from_dict(response.json())



        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[CreditAnswerDTO]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    money: float,

) -> Response[CreditAnswerDTO]:
    """ 
    Args:
        card_account_id (UUID):
        money (float):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CreditAnswerDTO]
     """


    kwargs = _get_kwargs(
        card_account_id=card_account_id,
money=money,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    money: float,

) -> CreditAnswerDTO | None:
    """ 
    Args:
        card_account_id (UUID):
        money (float):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CreditAnswerDTO
     """


    return sync_detailed(
        card_account_id=card_account_id,
client=client,
money=money,

    ).parsed

async def asyncio_detailed(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    money: float,

) -> Response[CreditAnswerDTO]:
    """ 
    Args:
        card_account_id (UUID):
        money (float):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CreditAnswerDTO]
     """


    kwargs = _get_kwargs(
        card_account_id=card_account_id,
money=money,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    money: float,

) -> CreditAnswerDTO | None:
    """ 
    Args:
        card_account_id (UUID):
        money (float):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CreditAnswerDTO
     """


    return (await asyncio_detailed(
        card_account_id=card_account_id,
client=client,
money=money,

    )).parsed
