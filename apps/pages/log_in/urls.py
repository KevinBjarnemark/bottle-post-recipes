from django.urls import path
from .views import log_in, submit_log_in


urlpatterns = [
    path(
        'log_in/',
        log_in,
        name='log_in'
    ),
    path(
        'submit_log_in/', submit_log_in, name='submit_log_in'
    ),
]
