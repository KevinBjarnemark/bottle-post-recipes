
from django.urls import path
from .views import submit_recipe, delete_recipe

urlpatterns = [
    path('submit_recipe/', submit_recipe, name='submit_recipe'),
    path('delete_recipe/', delete_recipe, name='delete_recipe'),
]
