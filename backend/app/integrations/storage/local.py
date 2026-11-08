import os
import uuid
import aiofiles
from fastapi import UploadFile
from app.core.config import settings


async def save_uploaded_file(file: UploadFile, folder: str = "images") -> str:
    """Save an uploaded file to local media storage and return URL."""
    target_dir = os.path.join(settings.LOCAL_STORAGE_PATH, folder)
    os.makedirs(target_dir, exist_ok=True)

    extension = os.path.splitext(file.filename or "")[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(target_dir, unique_filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    return f"/media/{folder}/{unique_filename}"

