import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery(
    "myapp",
    broker="redis://localhost:6379/0",
    include=["tasks.export"]
)

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()