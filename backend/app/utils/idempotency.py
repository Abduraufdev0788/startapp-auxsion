import uuid


def generate_idempotency_key(prefix: str = "req") -> str:
    """Generate a cryptographically unique idempotency key."""
    return f"{prefix}_{uuid.uuid4().hex}"

