from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.card_account import CardAccount
from ...models.card_account_create_dto import CardAccountCreateDto
from typing import cast
from uuid import UUID



def _get_kwargs(
    user_id: UUID,
    *,
    body: CardAccountCreateDto,

) -> dict[str, Any]:
    headers: dict[str, Any] = {}


    

    

    _kwargs: dict[str, Any] = {
        "method": "post",
        "url": "/core-api/cardaccount/open/{user_id}".format(user_id=quote(str(user_id), safe=""),),
    }

    _kwargs["json"] = body.to_dict()


    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> CardAccount | None:
    if response.status_code == 200:
        response_200 = CardAccount.from_dict(response.json())



        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[CardAccount]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CardAccountCreateDto,

) -> Response[CardAccount]:
    """ 
    Args:
        user_id (UUID):
        body (CardAccountCreateDto):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CardAccount]
     """


    kwargs = _get_kwargs(
        user_id=user_id,
body=body,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CardAccountCreateDto,

) -> CardAccount | None:
    """ 
    Args:
        user_id (UUID):
        body (CardAccountCreateDto):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CardAccount
     """


    return sync_detailed(
        user_id=user_id,
client=client,
body=body,

    ).parsed

async def asyncio_detailed(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CardAccountCreateDto,

) -> Response[CardAccount]:
    """ 
    Args:
        user_id (UUID):
        body (CardAccountCreateDto):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CardAccount]
     """


    kwargs = _get_kwargs(
        user_id=user_id,
body=body,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CardAccountCreateDto,

) -> CardAccount | None:
    """ 
    Args:
        user_id (UUID):
        body (CardAccountCreateDto):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CardAccount
     """


    return (await asyncio_detailed(
        user_id=user_id,
client=client,
body=body,

    )).parsed
