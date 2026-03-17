from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.bff_error_body import BffErrorBody
from ...models.credit import Credit
from typing import cast
from uuid import UUID



def _get_kwargs(
    card_account_id: UUID,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/credit-service/credit/{card_account_id}/get_by_card_account".format(card_account_id=quote(str(card_account_id), safe=""),),
    }


    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> BffErrorBody | Credit | None:
    if response.status_code == 200:
        response_200 = Credit.from_dict(response.json())



        return response_200

    if response.status_code == 400:
        response_400 = BffErrorBody.from_dict(response.json())



        return response_400

    if response.status_code == 401:
        response_401 = BffErrorBody.from_dict(response.json())



        return response_401

    if response.status_code == 403:
        response_403 = BffErrorBody.from_dict(response.json())



        return response_403

    if response.status_code == 422:
        response_422 = BffErrorBody.from_dict(response.json())



        return response_422

    if response.status_code == 500:
        response_500 = BffErrorBody.from_dict(response.json())



        return response_500

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[BffErrorBody | Credit]:
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

) -> Response[BffErrorBody | Credit]:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[BffErrorBody | Credit]
     """


    kwargs = _get_kwargs(
        card_account_id=card_account_id,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> BffErrorBody | Credit | None:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        BffErrorBody | Credit
     """


    return sync_detailed(
        card_account_id=card_account_id,
client=client,

    ).parsed

async def asyncio_detailed(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> Response[BffErrorBody | Credit]:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[BffErrorBody | Credit]
     """


    kwargs = _get_kwargs(
        card_account_id=card_account_id,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> BffErrorBody | Credit | None:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        BffErrorBody | Credit
     """


    return (await asyncio_detailed(
        card_account_id=card_account_id,
client=client,

    )).parsed
