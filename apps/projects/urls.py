from django.urls import path
from . import views

from apps.tasks.views import TaskCreateView
app_name = 'projects'

urlpatterns = [
    path("create/", views.ProjectCreateView.as_view(), name="create"),
    path("labels/add/", views.add_label_form, name="label-add"),
    path("<uuid:pk>/", views.ProjectDetailView.as_view(), name="detail"),
    path('<uuid:pk>/delete/', views.ProjectDeleteView.as_view(), name='delete'),
    path('<uuid:pk>/edit/', views.ProjectEditView.as_view(), name='edit'),
    path('<uuid:pk>/task/create', TaskCreateView.as_view(), name='create_task'),
    path('<uuid:pk>/export/create', views.ExportCreateView.as_view(), name='create_export'),
    path("", views.ProjectListView.as_view(), name="index")
]
