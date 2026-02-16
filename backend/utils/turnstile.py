"""async and sync functions to validate Turnstile tokens with Cloudflare's API."""

from typing import Optional

import httpx


class TurnstileValidationError(Exception):
    pass


class TurnstileValidationResponse:
    action: str
    cdata: str
    challenge_ts: str
    error_codes: list[str]
    hostname: str
    metadata: dict
    success: bool

    def __init__(self, data: dict):
        self.action = data.get("action", "")
        self.cdata = data.get("cdata", "")
        self.challenge_ts = data.get("challenge_ts", "")
        self.error_codes = data.get("error-codes", [])
        self.hostname = data.get("hostname", "")
        self.metadata = data.get("metadata", {})
        self.success = data.get("success", False)

    def __str__(self):
        return f"TurnstileValidationResponse(success={self.success}, action={self.action}, hostname={self.hostname}, error_codes={self.error_codes})"

    def __repr__(self) -> str:
        return self.__str__()


async def async_validate_turnstile(
    token: str,
    secret: str,
    remoteip: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    timeout: int = 10,
) -> TurnstileValidationResponse:
    """Asynchronously validate a Turnstile token with Cloudflare's API."""
    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    data = {"secret": secret, "response": token}

    if remoteip:
        data["remoteip"] = remoteip

    if idempotency_key:
        data["idempotency_key"] = idempotency_key

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, data=data)
            response.raise_for_status()
            return TurnstileValidationResponse(response.json())
    except Exception as e:
        raise TurnstileValidationError(f"Turnstile validation failed: {e}")


def validate_turnstile(
    token: str,
    secret: str,
    remoteip: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    timeout: int = 10,
) -> TurnstileValidationResponse:
    """Validate a Turnstile token with Cloudflare's API."""
    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    data = {"secret": secret, "response": token}

    if remoteip:
        data["remoteip"] = remoteip

    if idempotency_key:
        data["idempotency_key"] = idempotency_key

    try:
        with httpx.Client(timeout=timeout) as client:
            response = client.post(url, data=data)
            response.raise_for_status()
            return TurnstileValidationResponse(response.json())
    except Exception as e:
        raise TurnstileValidationError(f"Turnstile validation failed: {e}")
