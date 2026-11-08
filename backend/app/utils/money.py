"""Monetary utilities for AuctionHub.

RULE: Never use floating-point numbers for money calculations.
Store all amounts as BigInteger tiyin (1 UZS = 100 tiyin).
"""

from decimal import Decimal, ROUND_HALF_UP
from app.core.constants import UZS_MINOR_UNIT_MULTIPLIER


def uzs_to_tiyin(uzs_amount: int | float | str | Decimal) -> int:
    """Convert UZS (sum) amount to integer minor units (tiyin)."""
    dec_amount = Decimal(str(uzs_amount))
    tiyin = (dec_amount * Decimal(UZS_MINOR_UNIT_MULTIPLIER)).quantize(
        Decimal("1"), rounding=ROUND_HALF_UP
    )
    return int(tiyin)


def tiyin_to_uzs_decimal(tiyin_amount: int) -> Decimal:
    """Convert integer tiyin to Decimal UZS."""
    return Decimal(tiyin_amount) / Decimal(UZS_MINOR_UNIT_MULTIPLIER)


def format_uzs(tiyin_amount: int) -> str:
    """Format tiyin amount into a human-readable UZS currency string (e.g. '1 500 000 UZS')."""
    uzs = tiyin_to_uzs_decimal(tiyin_amount)
    # If there are no fractional tiyin, format without decimals
    if uzs == uzs.to_integral():
        return f"{int(uzs):,} UZS".replace(",", " ")
    return f"{uzs:,.2f} UZS".replace(",", " ")

