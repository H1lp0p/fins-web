from http import HTTPStatus
from typing import Any, cast
from urllib.parse import quote

import httpx

from ...client import AuthenticatedClient, Client
from ...types import Response, UNSET
from ... import errors

from ...models.credit_rule_answer_dto import CreditRuleAnswerDTO
from ...models.credit_rule_dto import CreditRuleDTO
from typing import cast
from uuid import UUID



def _get_kwargs(
    credit_rule_id: UUID,
    *,
    body: CreditRuleDTO,

) -> dict[str, Any]:
    headers: dict[str, Any] = {}


    

    

    _kwargs: dict[str, Any] = {
        "method": "put",
        "url": "/credit-service/credit_rule/{credit_rule_id}/edit".format(credit_rule_id=quote(str(credit_rule_id), safe=""),),
    }

    _kwargs["json"] = body.to_dict()


    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
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
    body: CreditRuleDTO,

) -> Response[CreditRuleAnswerDTO]:
    """ 
    Args:
        credit_rule_id (UUID):
        body (CreditRuleDTO):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CreditRuleAnswerDTO]
     """


    kwargs = _get_kwargs(
        credit_rule_id=credit_rule_id,
body=body,

    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)

def sync(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CreditRuleDTO,

) -> CreditRuleAnswerDTO | None:
    """ 
    Args:
        credit_rule_id (UUID):
        body (CreditRuleDTO):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CreditRuleAnswerDTO
     """


    return sync_detailed(
        credit_rule_id=credit_rule_id,
client=client,
body=body,

    ).parsed

async def asyncio_detailed(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CreditRuleDTO,

) -> Response[CreditRuleAnswerDTO]:
    """ 
    Args:
        credit_rule_id (UUID):
        body (CreditRuleDTO):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[CreditRuleAnswerDTO]
     """


    kwargs = _get_kwargs(
        credit_rule_id=credit_rule_id,
body=body,

    )

    response = await client.get_async_httpx_client().request(
        **kwargs
    )

    return _build_response(client=client, response=response)

async def asyncio(
    credit_rule_id: UUID,
    *,
    client: AuthenticatedClient | Client,
    body: CreditRuleDTO,

) -> CreditRuleAnswerDTO | None:
    """ 
    Args:
        credit_rule_id (UUID):
        body (CreditRuleDTO):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        CreditRuleAnswerDTO
     """


    return (await asyncio_detailed(
        credit_rule_id=credit_rule_id,
client=client,
body=body,

    )).parsed
