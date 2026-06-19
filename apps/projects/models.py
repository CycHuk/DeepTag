from django.db import models
import uuid
from django.conf import settings

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100, unique=True, blank=False, null=False)
    description = models.TextField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"

class Export(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project,on_delete=models.CASCADE,related_name="exports")

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.IN_PROGRESS)
    file = models.FileField( upload_to="exports/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "exports"

    def get_url_s3(self):
        if not self.file:
            return None

        url = self.file.url

        endpoint = (settings.AWS_S3_ENDPOINT_URL or "").rstrip("/")
        custom_endpoint = (
            getattr(settings, "AWS_S3_ENDPOINT_URL_CUSTOM", None)
            or endpoint
        ).rstrip("/")

        if endpoint and custom_endpoint:
            url = url.replace(endpoint, custom_endpoint, 1)

        return url