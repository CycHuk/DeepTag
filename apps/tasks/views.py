from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import CreateView

from apps.projects.models import Project
from apps.tasks.forms import TaskCreateForm
from apps.tasks.models import Task


class TaskCreateView(CreateView):
    model = Task
    form_class = TaskCreateForm
    template_name = 'tasks/create.html'

    def get_success_url(self):
        return reverse_lazy('projects:detail', kwargs={'pk': self.object.project.pk})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project_id = self.kwargs.get('pk')
        context['project'] = Project.objects.get(id=project_id)
        return context

    def form_valid(self, form):
        project_id = self.kwargs.get('pk')
        form.instance.project = get_object_or_404(Project, id=project_id)
        return super().form_valid(form)
