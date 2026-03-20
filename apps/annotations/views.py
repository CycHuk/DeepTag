from django.core.paginator import Paginator
from django.shortcuts import redirect
from django.views.generic import DetailView

from apps.annotations.models import Annotation
from apps.tasks.models import Task


class TaskAnnotationView(DetailView):
    template_name = 'annotations/main.html'
    model = Task
    paginate_by = 1

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        images = self.object.images.all().order_by('created_at')
        paginator = Paginator(images, self.paginate_by)

        page_number = self.request.GET.get('image', 1)
        page = paginator.get_page(page_number)

        if not page.object_list:
            return redirect('tasks:detail', pk=self.kwargs['pk'])

        image = page.object_list[0]

        context.update({
            'page': page,
            'image_obj': image,
            'labels': self.object.project.labels.all(),
            'annotations': Annotation.objects.filter(image=image)
        })

        return context
