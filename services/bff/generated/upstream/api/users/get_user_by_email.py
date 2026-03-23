from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.user_dto import UserDto
from typing import cast



def _get_kwargs(
    email: str,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/user-service/users/by-email/{email}".format(email=quote(str(email), safe=""),),
    }


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
    email: str,
    *,
    client: AuthenticatedClient | Client,

) -> Response[UserDto]:
    """ 
    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[UserDto]
     """


    kwargs = _get_kwargs(
        email=email,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    email: str,
    *,
    client: AuthenticatedClient | Client,

) -> UserDto | None:
    """ 
    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        UserDto
     """


    return sync_detailed(
        email=email,
client=client,

    ).parsed

async def asyncio_detailed(
    email: str,
    *,
    client: AuthenticatedClient | Client,

) -> Response[UserDto]:
    """ 
    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[UserDto]
     """


    kwargs = _get_kwargs(
        email=email,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    email: str,
    *,
    client: AuthenticatedClient | Client,

) -> UserDto | None:
    """ 
    Args:
        email (str):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        UserDto
     """


    return (await asyncio_detailed(
        email=email,
client=client,

    )).parsed
