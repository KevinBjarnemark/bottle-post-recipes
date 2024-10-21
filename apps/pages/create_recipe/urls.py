
from django.urls import path
from .views import create_recipe, submit_recipe

urlpatterns = [
    path('create_recipe/', create_recipe, name='create_recipe'),
    path('submit_recipe/', submit_recipe, name='submit_recipe'),
]
