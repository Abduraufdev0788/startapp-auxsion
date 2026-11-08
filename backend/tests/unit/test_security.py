from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
)


def test_password_hashing():
    raw_pass = "MySecretPass123"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPass123", hashed) is False


def test_jwt_access_token():
    user_id = "test-user-uuid"
    token = create_access_token(subject=user_id, claims={"role": "USER"})
    decoded = decode_token(token)
    assert decoded["sub"] == user_id
    assert decoded["role"] == "USER"
    assert decoded["type"] == "access"

