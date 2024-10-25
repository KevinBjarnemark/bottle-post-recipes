import pytest
from tests.helpers.py.helpers import (
    MOCKRECIPEDATA,
    user_log_in,
    create_mock_image
)
from django.urls import reverse
import json


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


def length_matches_total(expected_value, total_recipes, list_length):
    """Checks if the returned total_recipes are in
    harmony with the actual list length of recipes"""
    return total_recipes == list_length == expected_value


@pytest.mark.django_db
def searching_and_filtering(client):
    """A comprehensive search and filtering test"""
    user_log_in(client)
    # Create and submit all mocked recipes
    for recipe_data in MOCKRECIPEDATA:
        # Convert to JSON string
        dietary_attributes = json.dumps(recipe_data['dietary_attributes'])
        ingredients = json.dumps(recipe_data['ingredients'])
        preparation_time = json.dumps(recipe_data['preparation_time'])
        cooking_time = json.dumps(recipe_data['cooking_time'])
        estimate_price = json.dumps(recipe_data['estimate_price'])

        recipe = {
            'title': recipe_data['title'],
            'description': recipe_data['description'],
            'dietary_attributes': dietary_attributes,
            'image': create_mock_image(),
            'tags': recipe_data['tags'],
            'instructions': recipe_data['instructions'],
            'ingredients': ingredients,
            'preparation_time': preparation_time,
            'cooking_time': cooking_time,
            'estimate_price': estimate_price,
        }
        response = client.post(reverse('submit_recipe'), recipe)
        # Ensure successful response
        assert response.status_code == 200
    # Search for a vegan recipe
    vegan_recipe = search(client, 'Vegan Recipe')
    assert length_matches_total(
        expected_value=1,
        total_recipes=vegan_recipe['total_recipes'],
        list_length=len(vegan_recipe['recipes'])
    )
    assert vegan_recipe['recipes'][0]['title'] == "Vegan Recipe"
    assert not vegan_recipe['recipes'][0]['title'] == "Vegetarian Recipe"

    # Search for a recipe that doensn't exist
    non_existant_recipe = search(client, 'non-existant')
    assert length_matches_total(
        expected_value=0,
        total_recipes=non_existant_recipe['total_recipes'],
        list_length=len(non_existant_recipe['recipes'])
    )

    # Filter out vegan recipes
    non_vegan_recipes = filter_(client, 'vegan')
    # Check all titles
    for non_vegan_recipe in non_vegan_recipes["recipes"]:
        assert not non_vegan_recipe['title'] == "Vegan Recipe"
    # Should be 3 because there are 4 recipes in total
    assert length_matches_total(
        expected_value=3,
        total_recipes=non_existant_recipe['total_recipes'],
        list_length=len(non_existant_recipe['recipes'])
    )

    # Search for a vegetarian recipe and filter out meat recipes
    vegetarian_no_meat = search_and_filter(client, 'Vegetarian Recipe', 'meat')
    # Should return 1 vegetarian recipe
    assert length_matches_total(
        expected_value=1,
        total_recipes=vegetarian_no_meat['total_recipes'],
        list_length=len(vegetarian_no_meat['recipes'])
    )
    assert vegetarian_no_meat['recipes'][0]['title'] == "Vegetarian Recipe"
    assert vegetarian_no_meat['recipes'][0]['dietary_attributes'] != ["meat"]

    # Search for 'Recipe' across all titles and filter out vegan and vegetarian
    fish_and_meat = search_and_filter(client, 'Recipe', 'vegan,vegetarian')
    # Should return 2 recipes (fish and meat)
    assert length_matches_total(
        expected_value=2,
        total_recipes=fish_and_meat['total_recipes'],
        list_length=len(fish_and_meat['recipes'])
    )
    # Extract the titles of the returned recipes
    returned_titles = [recipe['title'] for recipe in fish_and_meat['recipes']]

    # Assert only "Fish Recipe" and "Meat Recipe" are in the results
    assert "Fish Recipe" in returned_titles
    assert "Meat Recipe" in returned_titles
    assert "Vegan Recipe" not in returned_titles
    assert "Vegetarian Recipe" not in returned_titles
