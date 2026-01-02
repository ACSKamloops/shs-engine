"""
Admin routes package for Pukaist Engine API.

This package wraps the legacy admin module providing backward-compatible imports.
The original monolithic admin.py has been preserved as _legacy.py and can be
incrementally refactored into smaller submodules over time.

Usage remains unchanged:
    from src.routes.admin import router
"""

from ._legacy import router

__all__ = ["router"]

