from django.contrib import admin
from .models import Recipe, Ingredient, Comment, Instruction, Time, EstimatedPricePerMeal

admin.site.register(Recipe)
admin.site.register(Ingredient)
admin.site.register(Comment)
admin.site.register(Instruction)
admin.site.register(Time)
admin.site.register(EstimatedPricePerMeal)
