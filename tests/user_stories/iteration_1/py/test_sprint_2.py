import pytest
from tests.helpers.py.helpers import (
    MOCKRECIPEDATA,
    user_log_in,
    create_mock_image,
    pass_spam_filter
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
    user = user_log_in(client)
    # Create and submit all mocked recipes
    for recipe_data in MOCKRECIPEDATA['recipes']:
        pass_spam_filter(user)

        # Convert to JSON string
        dietary_attributes = json.dumps(recipe_data['dietary_attributes'])
        ingredients = json.dumps(recipe_data['ingredients'])

        # Don't include fields that are generated in the back-end
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
        # Get the resonse data
        response_data = response.json()
        # Check if success is True
        assert response_data['success'] is True
        # Ensure no errors occured
        assert response_data['error'] == ""

    # Search for a vegan recipe
    vegan_recipe = search(client, 'Vegan Recipe')
    assert vegan_recipe['recipes'][0]['title'] == "Vegan Recipe"
    assert not vegan_recipe['recipes'][0]['title'] == "Vegetarian Recipe"

    # Search for a recipe that doensn't exist
    non_existant_recipe = search(client, 'non-existant')
    # Expect no recipes to be returned
    assert len(non_existant_recipe['recipes']) == 0

    # Filter out vegan recipes
    non_vegan_recipes = filter_(client, 'vegan')
    # Check all titles
    for non_vegan_recipe in non_vegan_recipes["recipes"]:
        assert not non_vegan_recipe['title'] == "Vegan Recipe"

    # Search for a vegetarian recipe and filter out meat recipes
    vegetarian_no_meat = search_and_filter(client, 'Vegetarian Recipe', 'meat')
    for vegetarian_no_meat_recipe in vegetarian_no_meat["recipes"]:
        assert not vegetarian_no_meat_recipe['title'] == "Meat Recipe"

    # Extract the titles of the returned recipes
    fish_and_meat = search_and_filter(client, 'Recipe', 'vegan,vegetarian')
    returned_titles = [recipe['title'] for recipe in fish_and_meat['recipes']]

    # Assert only "Fish Recipe" and "Meat Recipe" are in the results
    assert "Fish Recipe" in returned_titles
    assert "Meat Recipe" in returned_titles
    assert "Vegan Recipe" not in returned_titles
    assert "Vegetarian Recipe" not in returned_titles
