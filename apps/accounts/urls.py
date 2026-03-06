from django.urls import path
from . import views

app_name = 'auth'

urlpatterns = [
    path('login/', views.MyLoginView.as_view(), name='login'),
]
