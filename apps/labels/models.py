from django.db import models
import uuid

from apps.projects.models import Project


class Label(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    project = models.ForeignKey(Project, related_name="labels", on_delete=models.CASCADE)

    name = models.CharField(max_length=30, blank=False, null=False)
    color = models.CharField(max_length=7, blank=False,null=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "labels"
        unique_together = ("project", "name")


