from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required
from decorator_include import decorator_include
from django.contrib import admin
from django.urls import path, include

from config import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('projects/', decorator_include(login_required, 'apps.projects.urls')),
    path('tasks/', decorator_include(login_required, 'apps.tasks.urls')),
    path('', include('apps.accounts.urls')),
]

handler404 = 'apps.accounts.views.redirect_404'