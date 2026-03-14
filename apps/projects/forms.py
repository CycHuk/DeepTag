from django import forms
from django.core.exceptions import ValidationError
from django.forms import inlineformset_factory, BaseInlineFormSet, formset_factory

from .models import Project
from ..labels.forms import LabelCreateForm
from ..labels.models import Label


class ProjectCreateForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['name', 'description']


LabelsFormSet = inlineformset_factory(
    Project,
    Label,
    form=LabelCreateForm,
    extra=0,
    can_delete=True
)
