from django.urls import path
from . import views
from .views import home, load_recipes

urlpatterns = [
    path('', home, name='home'),
    path('load_recipes/', views.load_recipes, name='load_recipes'),
]