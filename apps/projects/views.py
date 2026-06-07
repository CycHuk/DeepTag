from django.contrib.auth.mixins import UserPassesTestMixin
from django.core.paginator import Paginator
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import CreateView, ListView, DetailView, DeleteView, UpdateView

from .forms import ProjectCreateForm, LabelsFormSet
from .models import Project
from ..tasks.models import Task


class ProjectListView(ListView):
    model = Project
    template_name = "projects/index.html"
    paginate_by = 6
    context_object_name = "projects"


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

    return render(request, "projects/label_form_row.html", {'index': form_index})


class ProjectDetailView(DetailView):
    model = Project
    context_object_name = "project"
    paginate_by = 8

    def get_template_names(self):
        if self.request.headers.get("HX-Request"):
            return ["tasks/task_cards.html"]
        return ["projects/detail.html"]

    def get_filtered_tasks(self):
        tasks = self.object.tasks.all()

        filter_type = self.request.GET.get("filter")
        task_type = self.request.GET.get("type")
        sort_order = self.request.GET.get("sort", "desc")

        if filter_type == "my" and self.request.user.is_authenticated:
            tasks = tasks.filter(assigned_to=self.request.user)

        elif filter_type == "free":
            tasks = tasks.filter(assigned_to__isnull=True)

        elif filter_type == "completed":
            tasks = tasks.filter(status=Task.Status.COMPLETED)

        if task_type:
            tasks = tasks.filter(type=task_type)

        if sort_order == "asc":
            tasks = tasks.order_by("created_at")
        else:
            tasks = tasks.order_by("-created_at")

        return tasks

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        tasks = self.get_filtered_tasks()

        paginator = Paginator(tasks, self.paginate_by)
        page = self.request.GET.get("page")

        context["page_tasks"] = paginator.get_page(page)

        return context


class ProjectDeleteView(UserPassesTestMixin, DeleteView):
    model = Project
    success_url = reverse_lazy('projects:index')

    def test_func(self):
        return self.request.user.is_superuser


class ProjectEditView(UpdateView):
    model = Project
    template_name = "projects/edit.html"
    form_class = ProjectCreateForm

    def get_success_url(self):
        return reverse_lazy('projects:detail', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form_data = self.request.session.pop('form_projects_edit', None)

        if form_data:
            context['form'] = self.form_class(form_data, instance=self.object)
            context['labels_formset'] = LabelsFormSet(data=form_data, instance=self.object, prefix='labels_formset')
        else:
            context['labels_formset'] = LabelsFormSet(instance=self.object, prefix='labels_formset')

        return context

    def form_invalid(self, form):
        self.request.session['form_projects_edit'] = self.request.POST

        return redirect('projects:edit', pk=self.object.pk)

    def form_valid(self, form):
        self.object = form.save()

        labels_formset = LabelsFormSet(
            self.request.POST,
            instance=self.object,
            prefix='labels_formset'
        )

        if labels_formset.is_valid():
            labels_formset.save()  # новые и существующие labels сохранятся
            return redirect('projects:detail', pk=self.object.pk)

        return self.form_invalid(form)

class ExportCreateView(View):
    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        return redirect("projects:detail", pk=project.id)

