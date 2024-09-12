    

from django.urls import path
from .views import create_recipe

urlpatterns = [
    path('create_recipe/', create_recipe, name='create_recipe'),
]
