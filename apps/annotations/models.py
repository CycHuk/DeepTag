import uuid

from django.db import models

from apps.labels.models import Label
from apps.tasks.models import Image


class Annotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    image = models.ForeignKey(Image, related_name='annotations', on_delete=models.CASCADE)
    label = models.ForeignKey(Label, related_name='annotations', on_delete=models.CASCADE)

    bbox = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'annotations'