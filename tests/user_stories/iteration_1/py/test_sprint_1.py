import pytest
from django.urls import reverse
from apps.pages.create_recipe.models import Recipe
from apps.users.models import User
from tests.helpers.helpers import user_log_in, create_mock_image
import json

# TODO Test vegan filter
# Move towards database filtering instead of client-side
# filtering, then create a vegan filter test


# Recipe creation, javascript insertion, and render
@pytest.mark.django_db
def test_recipe_creation_and_display(client):
    # Log in user
    user = user_log_in(client)
    # Convert to JSON string
    dietary_attributes = json.dumps(['gluten, dairy'])
    ingredient_data = json.dumps([
        {'name': 'Ingredient 1', 'quantity': 1},
        {'name': 'Ingredient 2', 'quantity': 200},
    ])
    preparation_time = json.dumps({
        'preparation-time-minutes': 0,
        'preparation-time-hours': 1,
        'preparation-time-days': 0,
    })
    cooking_time = json.dumps({
        'cooking-time-minutes': 20,
        'cooking-time-hours': 1,
        'cooking-time-days': 0,
    })
    estimate_price = json.dumps({
        'estimate-price-from': 20,
        'estimate-price-to': 40,
    })
    recipe = {
        'title': 'Test Recipe',
        'description': "Test description",
        'dietary_attributes': dietary_attributes,
        'image': create_mock_image(),
        'tags': 'test, recipe',
        'instructions': "Mix all ingredients.",
        'ingredients': ingredient_data,
        'preparation_time': preparation_time,
        'cooking_time': cooking_time,
        'estimate_price': estimate_price,
        'likes': 10,
        'bottle_posted_count': 5,
        'in_ocean': True,
        'vegan': True,
    }
    # Submit the form
    response = client.post(reverse('submit_recipe'), recipe)

    assert response.status_code == 200
    assert Recipe.objects.filter(title='Test Recipe').exists()

    # Verify that ingredients are associated with the recipe
    recipe_instance = Recipe.objects.get(user=user, title='Test Recipe')

    # Verify that ingredients are associated with the recipe
    ingredients = recipe_instance.ingredients.all()
    assert ingredients.count() == 2
    assert ingredients.filter(name="Ingredient 1", quantity=1).exists()
    assert ingredients.filter(name="Ingredient 2", quantity=200).exists()

    # NOTE Recipes are displayed with JS and there's a separate
    # JEST test for checking if they actually gets displayed.


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
    response = client.post(reverse('register'), data=signup_data)

    # Check that the user was created
    user_exists = User.objects.filter(username='new_user').exists()
    assert user_exists

    # Verify that a redirect occurs to the home page
    assert response.status_code == 302
    assert response.url == reverse('home')


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
    response = client.post(reverse('login'), data=login_data)

    # Check that the login was successful by verifying
    # redirection to the home page
    assert response.status_code == 302
    assert response.url == reverse('home')
