import pytest
from django.urls import reverse
from apps.pages.home.models import Recipe
from apps.users.models import User
from tests.helpers.py.helpers import (
    MOCKRECIPEDATA,
    user_log_in,
    create_mock_image,
    pass_spam_filter
)
import json


# Check user registration
@pytest.mark.django_db
def test_user_registration(client):
    # Define the signup data
    signup_data = {
        'username': 'new_user',
        'password1': 'securePassword123',
        'password2': 'securePassword123',
    }
    # Submit signup data
    response = client.post(reverse('register_account'), data=signup_data)

    # Check that the user was created
    user_exists = User.objects.filter(username='new_user').exists()
    assert user_exists

    # Parse the JSON response
    response_data = json.loads(response.content.decode('utf-8'))
    # Check that the response was successful
    assert response_data['success'] is True


# Check user login
@pytest.mark.django_db
def test_user_login(client, django_user_model):
    # Create a user in the database
    username = "testuser"
    password = "securePassword123"
    django_user_model.objects.create_user(username=username, password=password)

    # Define the login data
    login_data = {
        'username': username,
        'password': password,
    }

    # Submit login data
    response = client.post(reverse('submit_log_in'), data=login_data)

    # Parse the JSON response
    response_data = json.loads(response.content.decode('utf-8'))
    # Check that the response was successful
    assert response_data['success'] is True


# Check user profile
@pytest.mark.django_db
def test_user_profile_data_in_js(client):
    user = user_log_in(client)
    response = client.get(reverse('home'))
    content = response.content.decode()

    # Check if JSON is identical to user profile
    user_profile_json = json.loads(response.context['user_profile'])
    assert '"user-profile-data"' in response.content.decode()
    assert user_profile_json['vegan_mode'] == user.profile.vegan_mode

    # Check if vegan mode is True by default
    assert user.profile.vegan_mode is True

    # Check if vegan mode can be configured
    user.profile.vegan_mode = False
    user.profile.save()
    user.refresh_from_db()
    assert user.profile.vegan_mode is False

    # Check if vegan mode toggle button exists
    assert 'id="vegan-mode-button"' in content


# Recipe creation, javascript insertion, and render
@pytest.mark.django_db
def test_recipe_creation(client):
    # Log in user
    user = user_log_in(client)

    # Submit all mock recipes
    for recipe_data in MOCKRECIPEDATA['recipes']:
        pass_spam_filter(user)

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
        # Submit form
        response = client.post(reverse('submit_recipe'), recipe)
        # Ensure successful response
        assert response.status_code == 200
        # Ensure the recipe was created
        assert Recipe.objects.filter(title=recipe_data['title']).exists()
        # Get the created recipe instance
        recipe_instance = Recipe.objects.get(
            user=user, title=recipe_data['title']
        )
        # Deserialize submitted ingredients for verification
        submitted_ingredients = json.loads(ingredients)
        # Verify that ingredients are associated with the recipe
        for ingredient_data in submitted_ingredients:
            assert recipe_instance.ingredients.filter(
                name=ingredient_data['name'],
                quantity=ingredient_data['quantity']
            ).exists()

    # NOTE Recipes are displayed with JS, there are separate
    # JEST tests for checking if recipe components gets displayed.
