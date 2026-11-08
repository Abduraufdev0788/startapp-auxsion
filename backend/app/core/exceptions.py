from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AuctionHubException(HTTPException):
    """Base application exception with error code and detail."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str = "ERROR",
        headers: Optional[Dict[str, str]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class NotFoundException(AuctionHubException):
    def __init__(self, detail: str = "Resurs topilmadi", error_code: str = "NOT_FOUND"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code=error_code,
        )


class BadRequestException(AuctionHubException):
    def __init__(self, detail: str, error_code: str = "BAD_REQUEST"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code=error_code,
        )


class UnauthorizedException(AuctionHubException):
    def __init__(self, detail: str = "Avtorizatsiyadan o'tilmagan", error_code: str = "UNAUTHORIZED"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(AuctionHubException):
    def __init__(self, detail: str = "Ruxsat etilmagan amal", error_code: str = "FORBIDDEN"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code=error_code,
        )


class ConflictException(AuctionHubException):
    def __init__(self, detail: str, error_code: str = "CONFLICT"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code=error_code,
        )


class AuctionNotActiveException(BadRequestException):
    def __init__(self, detail: str = "Auksion ayni vaqtda faol emas"):
        super().__init__(detail=detail, error_code="AUCTION_NOT_ACTIVE")


class DepositRequiredException(ForbiddenException):
    def __init__(self, detail: str = "Auksionda qatnashish uchun depozit to'lanishi shart"):
        super().__init__(detail=detail, error_code="DEPOSIT_REQUIRED")


class InvalidBidAmountException(BadRequestException):
    def __init__(self, detail: str = "Taklif summasi minimal talabga javob bermaydi"):
        super().__init__(detail=detail, error_code="INVALID_BID_AMOUNT")


class SelfBiddingProhibitedException(ForbiddenException):
    def __init__(self, detail: str = "Sotuvchi o'z auksionida ishtirok eta olmaydi"):
        super().__init__(detail=detail, error_code="SELF_BIDDING_PROHIBITED")

