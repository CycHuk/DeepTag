import io
import json
import zipfile

from django.core.files.base import ContentFile

from apps.annotations.models import Annotation
from apps.labels.models import Label
from apps.projects.models import Project, Export
from apps.tasks.models import Task
from .app import app


@app.task
def export(project_id, export_id):
    project = Project.objects.get(id=project_id)
    export_obj = Export.objects.get(id=export_id)

    labels = Label.objects.filter(project=project)

    # label -> class_id
    label_map = {str(label.id): idx for idx, label in enumerate(labels)}

    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:

        # ---------------- YAML ----------------
        yaml_content = f"""path: dataset
train: images/train
val: images/val
test: images/test

nc: {len(label_map)}
names: {json.dumps([l.name for l in labels])}
"""
        zip_file.writestr("dataset/data.yaml", yaml_content)

        # ---------------- TASKS ----------------
        tasks = Task.objects.filter(project=project).prefetch_related("images")

        for task in tasks:
            split = task.type  # train/val/test

            for image in task.images.all():

                # ======================
                # 1. SAVE IMAGE (FIXED)
                # ======================
                image_data = image.file.read()

                image_zip_path = f"dataset/images/{split}/{image.id}.jpg"
                zip_file.writestr(image_zip_path, image_data)

                # ======================
                # 2. LABELS
                # ======================
                annotations = Annotation.objects.filter(image=image)

                label_lines = []

                for ann in annotations:
                    class_id = label_map[str(ann.label_id)]

                    # bbox already YOLO format
                    label_lines.append(f"{class_id} {ann.bbox}")

                label_zip_path = f"dataset/labels/{split}/{image.id}.txt"

                zip_file.writestr(
                    label_zip_path,
                    "\n".join(label_lines)
                )

    # ---------------- SAVE ZIP ----------------
    buffer.seek(0)

    filename = f"yolo_export_{export_obj.id}.zip"

    export_obj.file.save(
        filename,
        ContentFile(buffer.getvalue()),
        save=False
    )

    export_obj.status = Export.Status.COMPLETED
    export_obj.save(update_fields=["file", "status", "updated_at"])