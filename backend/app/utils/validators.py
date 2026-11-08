import re
from app.core.exceptions import BadRequestException

# Uzbekistan phone number pattern: +998 followed by 9 digits
UZ_PHONE_REGEX = re.compile(r"^\+998[0-9]{9}$")


def validate_uz_phone(phone: str) -> str:
    """Validate and normalize Uzbekistan phone number."""
    cleaned = phone.strip().replace(" ", "").replace("-", "")
    if not cleaned.startswith("+"):
        if cleaned.startswith("998"):
            cleaned = f"+{cleaned}"
        elif len(cleaned) == 9:
            cleaned = f"+998{cleaned}"

    if not UZ_PHONE_REGEX.match(cleaned):
        raise BadRequestException(
            "Telefon raqami formati noto'g'ri. Masalan: +998901234567",
            error_code="INVALID_PHONE_FORMAT",
        )
    return cleaned


def validate_password_strength(password: str) -> None:
    """Validate that password meets security requirements (min 8 chars, 1 digit, 1 letter)."""
    if len(password) < 8:
        raise BadRequestException(
            "Parol uzunligi kamida 8 ta belgidan iborat bo'lishi shart",
            error_code="WEAK_PASSWORD",
        )
    if not any(char.isdigit() for char in password):
        raise BadRequestException(
            "Parolda kamida 1 ta raqam bo'lishi shart",
            error_code="WEAK_PASSWORD",
        )
    if not any(char.isalpha() for char in password):
        raise BadRequestException(
            "Parolda kamida 1 ta harf bo'lishi shart",
            error_code="WEAK_PASSWORD",
        )

