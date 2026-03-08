from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.views.generic import CreateView

from .forms import ProjectCreateForm, LabelsFormSet
from .models import Project
from ..labels.models import Label

def index(request):
    return render(request, 'projects/index.html')


class ProjectCreateView(CreateView):
    template_name = "projects/create.html"
    model = Project
    form_class = ProjectCreateForm
    success_url = reverse_lazy('projects:index')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        if self.request.POST:
            context['label_formset'] = LabelsFormSet(self.request.POST)
        else:
            context['label_formset'] = LabelsFormSet()

        return context

    def form_valid(self, form):
        context = self.get_context_data()
        label_formset = context['label_formset']

        if form.is_valid() and label_formset.is_valid():
            self.object = form.save()

            labels = label_formset.save(commit=False)
            for label in labels:
                label.project = self.object
                label.save()
            return redirect(self.get_success_url())
        else:
            return self.render_to_response(self.get_context_data(form=form))


