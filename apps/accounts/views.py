from django.contrib.auth.views import LoginView
from django.shortcuts import render, redirect

from .forms import UserLoginForm


class MyLoginView(LoginView):
    template_name = "accounts/login.html"
    authentication_form = UserLoginForm
    redirect_authenticated_user = True

    def form_invalid(self, form):
        self.request.session['invalid_form_data'] = self.request.POST

        return redirect('auth:login')

    def get(self, request, *args, **kwargs):
        saved_form_data = request.session.pop('invalid_form_data', None)

        if saved_form_data:
            form = self.authentication_form(request, data=saved_form_data)
        else:
            form = self.get_form()

        return render(request, self.template_name, {'form': form})


def redirect_404(request, exception):
    return redirect('projects:index')
