from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.credit_rule_answer_dto import CreditRuleAnswerDTO
from typing import cast
from uuid import UUID



def _get_kwargs(
    credit_rule_id: UUID,

) -> dict[str, Any]:
    

    

    

    _kwargs: dict[str, Any] = {
        "method": "get",
        "url": "/credit-service/credit_rule/{credit_rule_id}/get_by_id".format(credit_rule_id=quote(str(credit_rule_id), safe=""),),
    }


    return _kwargs



def _parse_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> CreditRuleAnswerDTO | None:
    if response.status_code == 200:
        response_200 = CreditRuleAnswerDTO.from_dict(response.json())



        return response_200

    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(*, client: AuthenticatedClient | Client, response: httpx.Response) -> Response[CreditRuleAnswerDTO]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> Response[CreditRuleAnswerDTO]:
    """ 
    Args:
        credit_rule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CreditRuleAnswerDTO]
     """


    kwargs = _get_kwargs(
        credit_rule_id=credit_rule_id,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> CreditRuleAnswerDTO | None:
    """ 
    Args:
        credit_rule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CreditRuleAnswerDTO
     """


    return sync_detailed(
        credit_rule_id=credit_rule_id,
client=client,

    ).parsed

async def asyncio_detailed(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> Response[CreditRuleAnswerDTO]:
    """ 
    Args:
        credit_rule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CreditRuleAnswerDTO]
     """


    kwargs = _get_kwargs(
        credit_rule_id=credit_rule_id,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,

) -> CreditRuleAnswerDTO | None:
    """ 
    Args:
        credit_rule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CreditRuleAnswerDTO
     """


    return (await asyncio_detailed(
        credit_rule_id=credit_rule_id,
client=client,

    )).parsed
