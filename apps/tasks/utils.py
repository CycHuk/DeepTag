from io import BytesIO
from PIL import Image as PILImage
from django.core.files.base import ContentFile
from django.conf import settings

def process_image(file, output_filename):
    """
    Конвертирует любое изображение в JPG и ресайзит по большей стороне
    до settings.MAX_IMAGE_SIDE. Возвращает ContentFile для сохранения в ImageField.
    """
    img = PILImage.open(file)
    img = img.convert('RGB')

    max_side = getattr(settings, 'MAX_IMAGE_SIDE', 2048)
    if max(img.size) > max_side:
        ratio = max_side / max(img.size)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, PILImage.ANTIALIAS)

    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=90)
    content_file = ContentFile(buffer.getvalue(), name=output_filename)
    buffer.close()
    return content_file