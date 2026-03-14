from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path("create/", views.ProjectCreateView.as_view(), name="create"),
    path("labels/add/", views.add_label_form, name="label-add"),
    path("<uuid:pk>/", views.ProjectDetailView.as_view(), name="detail"),
    path('<uuid:pk>/delete/', views.ProjectDeleteView.as_view(), name='delete'),
    path("", views.ProjectListView.as_view(), name="index")
]
