from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.bff_error_body import BffErrorBody
from typing import cast



def _get_kwargs(
    
) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/user-service/users/directory",
    }


    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> BffErrorBody | None:
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


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[BffErrorBody]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient | Client,

) -> Response[BffErrorBody]:
    """  Краткий список пользователей для клиентского приложения (роль CLIENT и прочие без WORKER): id,
    отображаемое имя и валюта основного счёта. Полный список UserDto — только у WORKER (`GET /user-
    service/users`).

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[BffErrorBody]
     """


    kwargs = _get_kwargs(
        
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    *,
    client: AuthenticatedClient | Client,

) -> BffErrorBody | None:
    """  Краткий список пользователей для клиентского приложения (роль CLIENT и прочие без WORKER): id,
    отображаемое имя и валюта основного счёта. Полный список UserDto — только у WORKER (`GET /user-
    service/users`).

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        BffErrorBody
     """


    return sync_detailed(
        client=client,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient | Client,

) -> Response[BffErrorBody]:
    """  Краткий список пользователей для клиентского приложения (роль CLIENT и прочие без WORKER): id,
    отображаемое имя и валюта основного счёта. Полный список UserDto — только у WORKER (`GET /user-
    service/users`).

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[BffErrorBody]
     """


    kwargs = _get_kwargs(
        
    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    *,
    client: AuthenticatedClient | Client,

) -> BffErrorBody | None:
    """  Краткий список пользователей для клиентского приложения (роль CLIENT и прочие без WORKER): id,
    отображаемое имя и валюта основного счёта. Полный список UserDto — только у WORKER (`GET /user-
    service/users`).

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        BffErrorBody
     """


    return (await asyncio_detailed(
        client=client,

    )).parsed
