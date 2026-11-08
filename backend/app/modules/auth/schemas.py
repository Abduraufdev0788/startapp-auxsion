import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    phone: str = Field(..., description="O'zbekiston telefon raqami (+998901234567)")
    password: str = Field(..., min_length=8, description="Kamida 8 ta belgi, harf va raqam")
    full_name: str = Field(..., min_length=2, max_length=150, description="To'liq ism-familiya")
    email: Optional[EmailStr] = Field(None, description="Ixtiyoriy elektron pochta")


class LoginRequest(BaseModel):
    phone: str = Field(..., description="Telefon raqami")
    password: str = Field(..., description="Parol")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class AuthUserResponse(BaseModel):
    id: uuid.UUID
    phone: str
    email: Optional[str]
    full_name: str
    roles: List[str]
    is_active: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)
