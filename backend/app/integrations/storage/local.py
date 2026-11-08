import os
import uuid
import aiofiles
from fastapi import UploadFile
from app.core.config import settings


async def save_uploaded_file(file: UploadFile, folder: str = "media") -> str:
    """Save an uploaded file (image or video) to local media storage and return URL."""
    target_dir = os.path.join(settings.LOCAL_STORAGE_PATH, folder)
    os.makedirs(target_dir, exist_ok=True)

    extension = os.path.splitext(file.filename or "")[1].lower()
    if not extension:
        if file.content_type and "video" in file.content_type:
            extension = ".mp4"
        else:
            extension = ".jpg"

    unique_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(target_dir, unique_filename)

    # Stream write in 1MB chunks to support large photos and high-definition video files
    async with aiofiles.open(file_path, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            await out_file.write(chunk)

    return f"/media/{folder}/{unique_filename}"

