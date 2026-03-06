from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate


class UserLoginForm(AuthenticationForm):
    username = forms.EmailField(error_messages={
        'required': 'Пожалуйста, введите ваш email.',
        'invalid': 'Введите корректный адрес электронной почты.'
    }
    )
    password = forms.CharField(
        strip=False, error_messages={
            'required': 'Пожалуйста, введите пароль.'
        }
    )

    error_messages = {
        'invalid_login': "Пожалуйста, введите корректный email и пароль.",
        'inactive': "Этот аккаунт не активен.",
    }

    def confirm_login_allowed(self, user):
        if not user.is_active:
            raise forms.ValidationError(
                self.error_messages['inactive'],
                code='inactive',
            )
