from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse

from fastapi import HTTPException

from .config import Settings


def _is_ip_address(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False


def _is_global_ip(host: str) -> bool:
    ip = ipaddress.ip_address(host)
    return bool(ip.is_global)


def _resolve_ips(host: str, port: int) -> list[str]:
    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail={"message": f"callback_url host could not be resolved: {exc}"},
        )
    return list({info[4][0] for info in infos if info and info[4]})


def validate_callback_url(url: str, settings: Settings) -> None:
    if not url:
        return
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=400,
            detail={"message": "callback_url must start with http:// or https://"},
        )
    if parsed.username or parsed.password:
        raise HTTPException(
            status_code=400,
            detail={"message": "callback_url must not include credentials"},
        )
    host = parsed.hostname
    if not host:
        raise HTTPException(
            status_code=400,
            detail={"message": "callback_url must include a hostname"},
        )
    host_lc = host.lower()
    if settings.callback_allow_all:
        return

    allowlist = {h.lower() for h in (settings.callback_allowlist or [])}
    if host_lc in allowlist:
        return

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    if _is_ip_address(host_lc):
        if _is_global_ip(host_lc):
            return
        if settings.callback_allow_private:
            return
        raise HTTPException(
            status_code=400,
            detail={"message": "callback_url must not target private or loopback IPs"},
        )

    ips = _resolve_ips(host_lc, port)
    if not ips:
        raise HTTPException(
            status_code=400,
            detail={"message": "callback_url host did not resolve to an IP"},
        )
    if any(not _is_global_ip(ip) for ip in ips):
        if settings.callback_allow_private or host_lc in allowlist:
            return
        raise HTTPException(
            status_code=400,
            detail={"message": "callback_url must not resolve to private or loopback IPs"},
        )
