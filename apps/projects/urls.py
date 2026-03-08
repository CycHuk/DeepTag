from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path("create/", views.ProjectCreateView.as_view(), name="create"),
    path("", views.index, name="index")
]
