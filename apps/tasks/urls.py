from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    path('<uuid:pk>/', views.TaskDetailView.as_view(), name='detail'),
    path('<uuid:pk>/delete/', views.TaskDeleteView.as_view(), name='delete'),
    path('<uuid:pk>/take/', views.TakeTaskView.as_view(), name='take'),
    path('<uuid:pk>/complete/', views.CompleteTaskView.as_view(), name='complete'),
    path('<uuid:pk>/images/add/', views.TaskAddImageView.as_view(), name='add_images'),
]
