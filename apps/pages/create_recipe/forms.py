from django import forms
from .models import Recipe, Ingredient, Time, EstimatedPricePerMeal

class RecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = [
            'title', 
            'description', 
            'image', 
            'contains_alcohol', 
            'contains_dairy', 
            'vegan', 
            'tags', 
            'instructions'
        ]

class IngredientForm(forms.ModelForm):
    class Meta:
        model = Ingredient
        fields = ['name', 'quantity', 'unit']

class TimeForm(forms.ModelForm):
    class Meta:
        model = Time
        fields = [
            'preparation_minutes', 
            'preparation_hours', 
            'preparation_days', 
            'cooking_minutes', 
            'cooking_hours', 
            'cooking_days'
        ]

class EstimatedPricePerMealForm(forms.ModelForm):
    class Meta:
        model = EstimatedPricePerMeal
        fields = [
            'price_from', 
            'price_to', 
        ]
