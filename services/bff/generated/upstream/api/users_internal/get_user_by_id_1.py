from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.user_dto import UserDto
from typing import cast
from uuid import UUID



def _get_kwargs(
    id: UUID,
    *,
    x_api_key: str,

) -> dict[str, Any]:
    headers: dict[str, Any] = {}
    headers["X-API-KEY"] = x_api_key



    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/user-service/internal/users/{id}".format(id=quote(str(id), safe=""),),
    }


    _kwargs["headers"] = headers
    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> UserDto | None:
    if response.status_code == 200:
        response_200 = UserDto.from_dict(response.json())



        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[UserDto]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    id: UUID,
    *,
    client: AuthenticatedClient | Client,
    x_api_key: str,

) -> Response[UserDto]:
    """ 
    Args:
        id (UUID):
        x_api_key (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[UserDto]
     """


    kwargs = _get_kwargs(
        id=id,
x_api_key=x_api_key,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    id: UUID,
    *,
    client: AuthenticatedClient | Client,
    x_api_key: str,

) -> UserDto | None:
    """ 
    Args:
        id (UUID):
        x_api_key (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        UserDto
     """


    return sync_detailed(
        id=id,
client=client,
x_api_key=x_api_key,

    ).parsed

async def asyncio_detailed(
    id: UUID,
    *,
    client: AuthenticatedClient | Client,
    x_api_key: str,

) -> Response[UserDto]:
    """ 
    Args:
        id (UUID):
        x_api_key (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[UserDto]
     """


    kwargs = _get_kwargs(
        id=id,
x_api_key=x_api_key,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    id: UUID,
    *,
    client: AuthenticatedClient | Client,
    x_api_key: str,

) -> UserDto | None:
    """ 
    Args:
        id (UUID):
        x_api_key (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        UserDto
     """


    return (await asyncio_detailed(
        id=id,
client=client,
x_api_key=x_api_key,

    )).parsed
