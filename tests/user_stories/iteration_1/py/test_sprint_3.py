
import pytest
from django.urls import reverse
import json
from django.contrib.auth.models import User
from tests.helpers.py.helpers import (
    user_log_in,
    create_mock_image,
)


@pytest.mark.django_db
def test_submit_bottle_post_review(client):
    # Log in a user
    user = user_log_in(client)

    # Create and submit a mock recipe
    recipe = {
        'title': "Review Test Recipe",
        'description': "A recipe for testing review actions",
        'dietary_attributes': json.dumps(["dairy"]),
        'image': create_mock_image(),
        'instructions': "Mix, cook, and serve.",
        'ingredients': json.dumps([{'quantity': "1", 'name': "Milk"}]),
    }
    response = client.post(reverse('submit_recipe'), recipe)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data['success'] is True

    # Load the submitted recipe to get its ID
    load_response = client.get(
        reverse('load_recipes'), {'q': "Review Test Recipe"}
    )
    loaded_recipes = load_response.json()
    assert len(loaded_recipes['recipes']) > 0
    recipe_id = loaded_recipes['recipes'][0]['id']

    # Set the review recipe ID in the user's profile
    user.profile.review_recipe_id = recipe_id
    user.profile.save()

    # Perform the "BOTTLE_POST" action
    bottle_post_response = client.post(
        reverse('submit_bottle_post_review') + '?action=BOTTLE_POST'
    )
    assert bottle_post_response.status_code == 200
    bottle_post_data = bottle_post_response.json()
    assert bottle_post_data['success'] is True

    # Set the review recipe ID
    user.profile.review_recipe_id = recipe_id
    user.profile.save()

    # Perform the "BOTTLE_POST" action
    bottle_post_remove_response = client.post(
        reverse('submit_bottle_post_review') + '?action=DELETE'
    )
    assert bottle_post_remove_response.status_code == 200
    bottle_post_remove = bottle_post_remove_response.json()
    assert bottle_post_remove['success'] is True

    # Load the recipe again to check its state
    updated_recipe_response = client.get(
        reverse('load_recipes'), {'q': "Review Test Recipe"}
    )
    updated_recipe = updated_recipe_response.json()
    assert len(updated_recipe['recipes']) > 0
    updated_recipe_data = updated_recipe['recipes'][0]

    # Assert the recipe has in_ocean == False and bottle_posted_count == 1
    assert updated_recipe_data['in_ocean'] is False
    assert updated_recipe_data['bottle_posted_count'] == 1


@pytest.mark.django_db
def test_deleting_account(client):
    user_log_in(client)

    # Simulate a DELETE request with password data
    url = reverse('delete_account')
    response = client.delete(
        url,
        data=json.dumps({'password': 'testpassword'}),
        content_type='application/json'
    )

    # Assert a successful response
    assert response.status_code == 200
    json_response = response.json()
    assert json_response['success'] is True
    # Verify the user is deleted
    assert not User.objects.filter(username='testuser').exists()
