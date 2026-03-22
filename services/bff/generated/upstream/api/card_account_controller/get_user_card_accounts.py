from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.bff_error_body import BffErrorBody
from ...models.page_card_account import PageCardAccount
from ...types import UNSET, Unset
from typing import cast
from uuid import UUID



def _get_kwargs(
    user_id: UUID,
    *,
    page_index: int | Unset = 0,
    page_size: int | Unset = 30,

) -> dict[str, Any]:
    

    

    params: dict[str, Any] = {}

    params["pageIndex"] = page_index

    params["pageSize"] = page_size


    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}


    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/core-api/cardaccount/all/{user_id}".format(user_id=quote(str(user_id), safe=""),),
        "params": params,
    }


    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> BffErrorBody | PageCardAccount | None:
    if response.status_code == 200:
        response_200 = PageCardAccount.from_dict(response.json())



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


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[BffErrorBody | PageCardAccount]:
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
    page_index: int | Unset = 0,
    page_size: int | Unset = 30,

) -> Response[BffErrorBody | PageCardAccount]:
    """ 
    Args:
        user_id (UUID):
        page_index (int | Unset):  Default: 0.
        page_size (int | Unset):  Default: 30.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[BffErrorBody | PageCardAccount]
     """


    kwargs = _get_kwargs(
        user_id=user_id,
page_index=page_index,
page_size=page_size,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    page_index: int | Unset = 0,
    page_size: int | Unset = 30,

) -> BffErrorBody | PageCardAccount | None:
    """ 
    Args:
        user_id (UUID):
        page_index (int | Unset):  Default: 0.
        page_size (int | Unset):  Default: 30.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        BffErrorBody | PageCardAccount
     """


    return sync_detailed(
        user_id=user_id,
client=client,
page_index=page_index,
page_size=page_size,

    ).parsed

async def asyncio_detailed(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    page_index: int | Unset = 0,
    page_size: int | Unset = 30,

) -> Response[BffErrorBody | PageCardAccount]:
    """ 
    Args:
        user_id (UUID):
        page_index (int | Unset):  Default: 0.
        page_size (int | Unset):  Default: 30.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[BffErrorBody | PageCardAccount]
     """


    kwargs = _get_kwargs(
        user_id=user_id,
page_index=page_index,
page_size=page_size,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    user_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    page_index: int | Unset = 0,
    page_size: int | Unset = 30,

) -> BffErrorBody | PageCardAccount | None:
    """ 
    Args:
        user_id (UUID):
        page_index (int | Unset):  Default: 0.
        page_size (int | Unset):  Default: 30.

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        BffErrorBody | PageCardAccount
     """


    return (await asyncio_detailed(
        user_id=user_id,
client=client,
page_index=page_index,
page_size=page_size,

    )).parsed
