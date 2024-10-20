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
        'dietary_attributes': ['gluten, dairy'],
        'vegan': False,
        'tags': 'test, recipe',
        'instructions': 'Mix all ingredients.',
        'preparation_time': {
              'preparation-time-minutes': 0,
              'preparation-time-hours': 1,
              'preparation-time-days': 0,
        },
        'cooking_time': {
                'cooking-time-minutes': 20,
                'cooking-time-hours': 1,
                'cooking-time-days': 0,
        },
        'estimate_price': {
              'estimate-price-from': 20,
              'estimate-price-to': 40,
        },
        'ingredients': [
            {'name': 'Ingredient 1', 'quantity': 1},
            {'name': 'Ingredient 2', 'quantity': 200},
        ],
    }

    # Convert to JSON string
    dietary_attributes = json.dumps(recipe_data['dietary_attributes'])
    ingredient_data = json.dumps(recipe_data['ingredients'])
    preparation_time = json.dumps(recipe_data['preparation_time'])
    cooking_time = json.dumps(recipe_data['cooking_time'])
    estimate_price = json.dumps(recipe_data['estimate_price'])

    # Submit the form
    response = client.post(reverse('submit_recipe'), {
        'title': recipe_data['title'],
        'description': recipe_data['description'],
        'dietary_attributes': dietary_attributes,
        'vegan': recipe_data['vegan'],
        'tags': recipe_data['tags'],
        'instructions': recipe_data['instructions'],
        'ingredients': ingredient_data,
        'preparation_time': preparation_time,
        'cooking_time': cooking_time,
        'estimate_price': estimate_price,
    })

    assert response.status_code == 200
    assert Recipe.objects.filter(title='Test Recipe').exists()
