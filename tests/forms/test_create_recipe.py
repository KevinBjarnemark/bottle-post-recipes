import pytest
from django.urls import reverse
from apps.pages.create_recipe.models import Recipe
from tests.helpers.helpers import user_log_in
import json

@pytest.mark.django_db
def test_create_recipe(client):
    user_log_in(client)
    # Define the form data
    recipe_data = {
        'title': 'Test Recipe',
        'description': 'Test description',
        'contains_alcohol': False,
        'contains_dairy': True,
        'vegan': False,
        'tags': 'test, recipe',
        'instructions': 'Mix all ingredients.',
    }

    # Create ingredient data
    ingredients = [
        {'name': 'Ingredient 1', 'quantity': 1, 'unit': 'kg'},
        {'name': 'Ingredient 2', 'quantity': 200, 'unit': 'g'},
    ]
    # Convert to JSON string
    ingredient_data = json.dumps(ingredients)

    # Submit the form
    response = client.post(reverse('create_recipe'), {
        'title': recipe_data['title'],
        'description': recipe_data['description'],
        'contains_alcohol': recipe_data['contains_alcohol'],
        'contains_dairy': recipe_data['contains_dairy'],
        'vegan': recipe_data['vegan'],
        'tags': recipe_data['tags'],
        'instructions': recipe_data['instructions'],
        'ingredients': ingredient_data,
    })

    assert response.status_code == 200
    assert Recipe.objects.filter(title='Test Recipe').exists()
