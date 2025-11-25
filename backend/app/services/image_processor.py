"""
Image processing service module
"""

from PIL import Image
import io
from fastapi import HTTPException, status
from app.core.logging import get_logger

logger = get_logger(__name__)

class ImageProcessor:
    """Handle image processing operations"""
    
    @staticmethod
    def validate_image(image_bytes: bytes) -> None:
        """Validate bytes are a real image"""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.verify()
            logger.debug("Image validation successful")
        except Exception as e:
            logger.error(f"Invalid image: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or corrupted image file"
            )
    
    @staticmethod
    def remove_background(image_bytes: bytes) -> bytes:
        """Remove background from image"""
        try:
            logger.info("Starting background removal")
            # Import rembg lazily to avoid slow startup/device discovery
            # and to keep module import lightweight.
            from rembg import remove

            # The AI magic happens here!
            output = remove(image_bytes)
            
            # Open the result
            result_image = Image.open(io.BytesIO(output))
            
            # Make sure it has transparency
            if result_image.mode != 'RGBA':
                result_image = result_image.convert('RGBA')
            
            # Convert to bytes
            output_buffer = io.BytesIO()
            result_image.save(output_buffer, format='PNG', optimize=True)
            output_buffer.seek(0)
            
            logger.info("Background removal completed")
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing image: {str(e)}"
            )
    
    @classmethod
    def process(cls, image_bytes: bytes) -> bytes:
        """Main entry point: validate then process"""
        cls.validate_image(image_bytes)
        return cls.remove_background(image_bytes)