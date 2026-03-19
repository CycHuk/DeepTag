from django import forms
from multiupload_plus.fields import MultiImageField

from apps.tasks.models import Task


class TaskCreateForm(forms.ModelForm):
    images = MultiImageField(required=False)

    class Meta:
        model = Task
        fields = ['type']

class TaskAddImageForm(forms.Form):
    images = MultiImageField(required=False)