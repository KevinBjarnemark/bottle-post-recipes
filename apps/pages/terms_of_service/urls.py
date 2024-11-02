from django.urls import path
from .views import terms_of_service


urlpatterns = [
    path('terms_of_service/', terms_of_service, name='terms_of_service')
]
