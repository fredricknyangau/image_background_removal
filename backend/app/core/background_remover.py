from rembg import remove, new_session
from functools import lru_cache

@lru_cache(maxsize=1)
def get_rembg_session():
    """Initialize rembg session once and cache it"""
    return new_session("u2net")

async def remove_background(image: bytes) -> bytes:
    session = get_rembg_session()  # Downloads model on first call
    return remove(image, session=session)