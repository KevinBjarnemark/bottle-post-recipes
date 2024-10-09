import pytest
from django.urls import reverse
from apps.pages.create_recipe.models import Recipe
from tests.helpers.helpers import user_log_in, create_mock_image
import json

# Check if the homepage loads
@pytest.mark.django_db
def test_homepage_loads(client):
    response = client.get(reverse('home'))
    assert response.status_code == 200

# Check if the homepage is using correct templates
@pytest.mark.django_db
def test_homepage_uses_correct_templates_guest(client):
    response = client.get(reverse('home'))
    templates_used = [t.name for t in response.templates]
    # Should render
    assert 'base.html' in templates_used
    assert 'components/page/hint_window.html' in templates_used
    assert 'components/user/login_required.html' in templates_used
    assert 'components/page/sidebar.html' in templates_used
    # Should not should not render
    assert 'components/page/recipe_feed.html' not in templates_used

# Check if the homepage is using correct templates
@pytest.mark.django_db
def test_homepage_uses_correct_templates_user(client):
    user_log_in(client)
    response = client.get(reverse('home'))
    # Test the homepage as a guest/user
    templates_used = [t.name for t in response.templates]
    # Should render
    assert 'base.html' in templates_used
    assert 'components/page/hint_window.html' in templates_used
    assert 'components/page/sidebar.html' in templates_used
    assert 'components/page/recipe_feed.html' in templates_used
    # Should not should not render
    assert 'components/user/login_required.html' not in templates_used

# Check if profile data is rendered in JSON script tag
@pytest.mark.django_db
def test_user_profile_data_in_js(client):
    user = user_log_in(client)
    response = client.get(reverse('home'))
    user_profile_json = json.loads(response.context['user_profile'])
    assert '"user-profile-data"' in response.content.decode()
    assert user_profile_json['vegan_mode'] == user.profile.vegan_mode

@pytest.mark.django_db
def test_recipes_data_in_js(client):
    # Log in the user and create a test recipe
    user = user_log_in(client)
    recipe = Recipe.objects.create(
        user=user,
        image = create_mock_image(),
        title="Test Recipe",
        description="Test Description",
        likes=10,
        bottle_posted_count=5,
        in_ocean=True,
        contains_alcohol=False,
        contains_dairy=True,
        vegan=False,
        tags="test, recipe",
        instructions="Step 1: Mix ingredients."
    )
    # Make a request to the home page
    response = client.get(reverse('home'))
    # Parse the JSON data rendered in the HTML
    content = response.content.decode()
    assert '"recipesJSON-data"' in content
    # Check if the recipe ID is in the JSON script tag
    assert str(recipe.id) in content  

@pytest.mark.django_db
def test_js_feed_file_exclusion_guest(client):
    response = client.get(reverse('home'))
    assert 'js/feed.js' not in response.content.decode()

@pytest.mark.django_db
def test_js_feed_file_inclusion_user(client):
    user_log_in(client)
    response = client.get(reverse('home'))
    assert 'js/feed.js' in response.content.decode()
