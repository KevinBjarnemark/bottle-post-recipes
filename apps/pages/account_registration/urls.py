from django.urls import path
from .views import account_registration, register_account


urlpatterns = [
    path(
        'account_registration/',
        account_registration,
        name='account_registration'
    ),
    path(
        'register_account/', register_account, name='register_account'
    ),
]
