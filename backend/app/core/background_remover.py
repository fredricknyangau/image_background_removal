from functools import lru_cache


@lru_cache(maxsize=1)
def get_rembg_session():
    """Initialize rembg session once and cache it.

    Import `rembg` lazily inside this function to avoid triggering
    heavy ONNX/driver discovery at application import time which
    slows container startup and can cause platform port-scans to fail.
    """
    from rembg import new_session

    return new_session("u2net")


async def remove_background(image: bytes) -> bytes:
    # Import `remove` lazily to avoid importing `rembg` during module import.
    from rembg import remove

    session = get_rembg_session()  # Downloads model on first call
    return remove(image, session=session)