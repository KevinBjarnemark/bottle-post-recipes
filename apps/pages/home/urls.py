from django.urls import path
from .views import home, load_recipes

urlpatterns = [
    path('', home, name='home'),
    path('load_recipes/', load_recipes, name='load_recipes'),
]
