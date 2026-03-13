from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView

from .forms import ProjectCreateForm, LabelsFormSet
from .models import Project

def index(request):
    return render(request, 'projects/index.html')


class ProjectCreateView(CreateView):
    template_name = "projects/create.html"
    model = Project
    form_class = ProjectCreateForm
    success_url = reverse_lazy('projects:index')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form_data = self.request.session.pop('form_projects_create', None)


        if form_data:
            context['form'] = self.form_class(form_data)
            context['labels_formset'] = LabelsFormSet(data=form_data, prefix='labels_formset')
        else:
            context['labels_formset'] = LabelsFormSet(prefix='labels_formset')

        return context

    def form_invalid(self, form):
        self.request.session['form_projects_create'] = self.request.POST

        return redirect('projects:create')

    def form_valid(self, form):
        project = form.save(commit=False)
        labels_formset = LabelsFormSet(
            data=self.request.POST,
            instance=project,
            prefix='labels_formset'
        )

        if labels_formset.is_valid():
            project.save()
            labels_formset.save()
        else:
            return self.form_invalid(form)

        return redirect('projects:index')


def add_label_form(request):
    form_index = request.GET.get("labels_formset-TOTAL_FORMS", 0)

    return render(request,"projects/label_form_row.html", {'index': form_index})







