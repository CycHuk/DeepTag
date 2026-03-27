import json

from django.core.paginator import Paginator
from django.http import HttpResponse
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse
from django.views import View
from django.views.generic import DetailView

from apps.annotations.forms import AnnotationFormSet
from apps.annotations.models import Annotation
from apps.tasks.models import Task, Image


class TaskAnnotationView(DetailView):
    template_name = 'annotations/main.html'
    context_object_name = 'task'
    model = Task
    paginate_by = 1

    def get_template_names(self):
        if self.request.headers.get('HX-Request'):
            return ['annotations/update.html']
        return ['annotations/main.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        images = self.object.images.all().order_by('created_at')
        paginator = Paginator(images, self.paginate_by)

        page_number = self.request.GET.get('image', 1)
        page = paginator.get_page(page_number)

        if not page.object_list:
            return redirect('tasks:detail', pk=self.kwargs['pk'])

        image = page.object_list[0]

        formset = AnnotationFormSet(instance=image)

        formset_data = [
            {
                **(form.cleaned_data if form.is_valid() else {f.name: f.value() for f in form}),
                "DELETE": False if (form.cleaned_data.get("DELETE") if form.is_valid() else form[
                    "DELETE"].value()) is None else (
                    form.cleaned_data.get("DELETE") if form.is_valid() else form["DELETE"].value())
            }
            for form in formset
        ]

        context.update({
            'page': page,
            'image': image,
            'labels': list(self.object.project.labels.values('id', 'name', 'color')),
            'formset': formset,
            'formset_data': formset_data,
        })

        return context

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        context = self.get_context_data(**kwargs)

        image_id = request.POST.get('image_id')
        if not image_id:
            context['message'] = "Ошибка: не удалось сохранить изменения."
            return self.render_to_response(context)

        image = self.object.images.filter(id=image_id).first()
        if not image:
            context['message'] = "Ошибка: не удалось сохранить изменения."
            return self.render_to_response(context)

        formset = AnnotationFormSet(request.POST, instance=image)
        if formset.is_valid():
            formset.save()
        else:
            context['message'] = "Ошибка: не удалось сохранить изменения."


        return self.render_to_response(context)


class TaskAnnotationSaveView(View):
    def post(self, request, *args, **kwargs):
        image_id = request.POST.get('image_id')
        image = get_object_or_404(Image, pk=image_id)

        formset = AnnotationFormSet(request.POST, instance=image)
        if formset.is_valid():
            formset.save()

        response = HttpResponse()
        response["HX-Redirect"] = reverse('tasks:detail', kwargs={'pk': image.task.pk})
        return response

