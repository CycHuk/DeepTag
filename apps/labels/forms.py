from django import forms
import re
from .models import Label


class LabelCreateForm(forms.ModelForm):
    class Meta:
        model = Label
        fields = ['name', 'color']

    def clean_color(self):
        color = self.cleaned_data.get('color')

        if not re.match(r'^#[0-9a-fA-F]{6}$', color):
            raise forms.ValidationError("Цвет должен быть в формате #ffffff")

        return color
