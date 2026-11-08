from decimal import Decimal
from app.utils.money import uzs_to_tiyin, tiyin_to_uzs_decimal, format_uzs


def test_uzs_to_tiyin():
    assert uzs_to_tiyin(500000) == 50000000
    assert uzs_to_tiyin("100.50") == 10050
    assert uzs_to_tiyin(Decimal("1000")) == 100000


def test_tiyin_to_uzs_decimal():
    assert tiyin_to_uzs_decimal(50000000) == Decimal("500000")
    assert tiyin_to_uzs_decimal(10050) == Decimal("100.50")


def test_format_uzs():
    assert format_uzs(50000000) == "500 000 UZS"
    assert format_uzs(10050) == "100.50 UZS"

