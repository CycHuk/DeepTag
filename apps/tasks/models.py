from django.db import models
import uuid

from apps.accounts.models import User
from apps.projects.models import Project


class Task(models.Model):
    class Type(models.TextChoices):
        TRAIN = 'train', 'Training'
        VAL = 'val', 'Validation'
        TEST = 'test', 'Testing'

    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    project = models.ForeignKey(Project, related_name="tasks", on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, related_name="tasks", null=True, blank=True, on_delete=models.SET_NULL)

    type = models.CharField(max_length=5, choices=Type.choices, default=Type.TRAIN)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.IN_PROGRESS)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return f"Task {self.id} - {self.get_type_display()} ({self.get_status_display()})"

    def assign_to(self, user):
        self.assigned_to = user
        self.status = self.Status.IN_PROGRESS
        self.save()
