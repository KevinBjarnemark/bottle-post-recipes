from django.contrib import admin
from .models import Recipe, Ingredient, Comment, Time, EstimatedPricePerMeal, DietaryAttribute

admin.site.register(Recipe)
admin.site.register(Ingredient)
admin.site.register(Comment)
admin.site.register(Time)
admin.site.register(EstimatedPricePerMeal)
admin.site.register(DietaryAttribute)
