from django import forms

from apps.annotations.models import Annotation


class AnnotationForm(forms.ModelForm):
    class Meta:
        model = Annotation
        fields = ['label', 'bbox']

    def clean_bbox(self):
        bbox = self.cleaned_data.get('bbox')

        if not bbox:
            raise forms.ValidationError("BBox не может быть пустым.")

        parts = bbox.strip().split()
        if len(parts) != 4:
            raise forms.ValidationError("BBox должен содержать 4 числа, разделенных пробелами.")

        try:
            numbers = [float(p) for p in parts]
        except ValueError:
            raise forms.ValidationError("Все значения BBox должны быть числами.")

        for n in numbers:
            if not (0 <= n <= 1):
                raise forms.ValidationError("Все числа BBox должны быть в диапазоне от 0 до 1.")

        return bbox
