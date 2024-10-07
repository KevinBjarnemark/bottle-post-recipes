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
        # Add custom widgets to the js generated form
        widgets = {
                'title': forms.TextInput(attrs={'placeholder': 'Summer salad'}),
                'description': forms.Textarea(attrs={'placeholder': 'A fruity salad with some crunch, perfect for.......'}),
                'instructions': forms.Textarea(attrs={'placeholder': '1. ........\n2. ........\n3. ........'}),
                'tags': forms.TextInput(attrs={'placeholder': 'healthy, lunch, fresh'}),
            }

class IngredientForm(forms.ModelForm):
    class Meta:
        model = Ingredient
        fields = ['name', 'quantity']

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
