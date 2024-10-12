import pytest
from django.urls import reverse
from apps.pages.create_recipe.models import Recipe, Ingredient
from apps.users.models import User
from tests.helpers.helpers import user_log_in, create_mock_image
import json

# TODO Test vegan filter
# Move towards database filtering instead of client-side 
# filtering, then create a vegan filter test 


# Recipe creation, javascript insertion, and render
@pytest.mark.django_db
def test_recipe_creation_and_display(client):
    # Log in the user
    user = user_log_in(client)
    # Create a new recipe
    recipe = Recipe.objects.create(
        user=user,
        image=create_mock_image(), # Check!
        title="Test Recipe", # Check!
        description="A delightful test recipe.", # Check!
        likes=10,
        bottle_posted_count=5,
        in_ocean=True,
        contains_alcohol=False,
        contains_dairy=True,
        vegan=True,
        tags="test, recipe",
        instructions="1. Mix test ingredients",
    )

    # Add ingredients
    Ingredient.objects.create(recipe=recipe, name="Tomatoes", quantity="3")
    Ingredient.objects.create(recipe=recipe, name="Onion", quantity="1")
    
    # Verify that ingredients are associated with the recipe
    ingredients = recipe.ingredients.all()
    assert ingredients.count() == 2
    assert ingredients.filter(name="Tomatoes").exists()
    assert ingredients.filter(name="Onion").exists()

    # Check if the recipe is created and present in the database
    assert Recipe.objects.filter(title="Test Recipe").exists()

    # Load the main feed
    response = client.get(reverse('home'))
    content = response.content.decode()

    # Check that the recipe is displayed in the response
    assert "Test Recipe" in content
    assert "A delightful test recipe." in content

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
    user = django_user_model.objects.create_user(username=username, password=password)
    
    # Define the login data
    login_data = {
        'username': username,
        'password': password,
    }
    
    # Submit login data
    response = client.post(reverse('login'), data=login_data)
    
    # Check that the login was successful by verifying redirection to the home page
    assert response.status_code == 302
    assert response.url == reverse('home')
