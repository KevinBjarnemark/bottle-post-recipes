import pytest
from tests.helpers.py.helpers import (
    MOCKRECIPEDATA,
    user_log_in,
    create_mock_image
)
from django.urls import reverse
import json
""" from django.utils import timezone
from apps.pages.home.models import Recipe, Ingredient, Comment """


def search(client, query):
    """Utilizing search function"""
    response = client.get(reverse('load_recipes'), {'q': query})
    return response.json()


def filter_(client, recipe_type_exclude):
    """Utilizing filter function"""
    response = client.get(
        reverse('load_recipes'), {'recipe_types_exclude': recipe_type_exclude}
    )
    return response.json()


def search_and_filter(client, query, recipe_type_exclude):
    """Perform search and filter together"""
    response = client.get(reverse('load_recipes'), {
        'q': query,
        'recipe_types_exclude': recipe_type_exclude
    })
    return response.json()


@pytest.mark.django_db
def test_searching_and_filtering(client):
    user_log_in(client)
    # Create and submit all mocked recipes
    for recipe_data in MOCKRECIPEDATA['recipes']:
        print(recipe_data)
        # Convert to JSON string
        dietary_attributes = json.dumps(recipe_data['dietary_attributes'])
        ingredients = json.dumps(recipe_data['ingredients'])

        recipe = {
            'title': recipe_data['title'],
            'description': recipe_data['description'],
            'dietary_attributes': dietary_attributes,
            'image': create_mock_image(),
            'instructions': recipe_data['instructions'],
            'ingredients': ingredients,
        }
        response = client.post(reverse('submit_recipe'), recipe)
        # Ensure successful response
        assert response.status_code == 200
    # Search for a vegan recipe
    vegan_recipe = search(client, 'Vegan Recipe')
    assert vegan_recipe['recipes'][0]['title'] == "Vegan Recipe"
    assert not vegan_recipe['recipes'][0]['title'] == "Vegetarian Recipe"
    # Filter out vegan recipes
    non_vegan_recipes = filter_(client, 'vegan')
    # Check all titles
    for non_vegan_recipe in non_vegan_recipes["recipes"]:
        assert not non_vegan_recipe['title'] == "Vegan Recipe"
