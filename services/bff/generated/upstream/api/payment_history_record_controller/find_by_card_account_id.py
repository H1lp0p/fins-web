from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.payment_history_record_dto import PaymentHistoryRecordDTO
from typing import cast
from uuid import UUID



def _get_kwargs(
    card_account_id: UUID,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/credit-service/payment_history_record/{card_account_id}/find_by_card_account_id".format(card_account_id=quote(str(card_account_id), safe=""),),
    }


    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> list[PaymentHistoryRecordDTO] | None:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = PaymentHistoryRecordDTO.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[list[PaymentHistoryRecordDTO]]:
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

) -> Response[list[PaymentHistoryRecordDTO]]:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[list[PaymentHistoryRecordDTO]]
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

) -> list[PaymentHistoryRecordDTO] | None:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        list[PaymentHistoryRecordDTO]
     """


    return sync_detailed(
        card_account_id=card_account_id,
client=client,

    ).parsed

async def asyncio_detailed(
    card_account_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> Response[list[PaymentHistoryRecordDTO]]:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[list[PaymentHistoryRecordDTO]]
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

) -> list[PaymentHistoryRecordDTO] | None:
    """ 
    Args:
        card_account_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        list[PaymentHistoryRecordDTO]
     """


    return (await asyncio_detailed(
        card_account_id=card_account_id,
client=client,

    )).parsed
