"""async and sync functions to validate Turnstile tokens with Cloudflare's API."""

from __future__ import annotations

from typing import Literal, Optional

import httpx


class TurnstileValidationError(Exception):
    """Custom exception for Turnstile validation errors."""

    pass


TurnstileErrorCodes = Literal[
    "missing-input-secret",
    "invalid-input-secret",
    "missing-input-response",
    "invalid-input-response",
    "bad-request",
    "timeout-or-duplicate",
    "internal-error",
]


class TurnstileValidationResponse:
    """Represents the response from Cloudflare's Turnstile validation API."""

    action: str
    """Custom action identifier from client-side"""
    cdata: str
    """Custom data payload from client-side"""
    challenge_ts: str
    """ISO timestamp when the challenge was solved"""
    error_codes: list[TurnstileErrorCodes] | list[str]
    """Array of error codes (if validation failed)"""
    hostname: str
    """Hostname where the challenge was served"""
    metadata: dict
    """metadata.ephemeral_id: Device fingerprint ID (Enterprise only)"""
    success: bool
    """Boolean indicating if validation was successful"""

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


async def async_validate(
    token: str,
    secret: str,
    remoteip: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    timeout: int = 10,
) -> TurnstileValidationResponse:
    """
    Asynchronously validate a Turnstile token with Cloudflare's API.
    Args:
        secret: Your widget's secret key from the Cloudflare dashboard.
        token: The token from the client-side widget
        remoteip: (Optional) The visitor's IP address
        idempotency_key: (Optional) UUID for retry protection
    """
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


def validate(
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


if __name__ == "__main__":
    # Example usage
    test_token = "your-turnstile-token-here"
    test_secret = "your-turnstile-secret-here"
    try:
        result = validate(test_token, test_secret)
        print(result)
    except TurnstileValidationError as e:
        print(e)
