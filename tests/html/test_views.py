import pytest
from django.urls import reverse
from tests.helpers.helpers import user_log_in

# Check if the homepage loads
@pytest.mark.django_db
def test_homepage_loads(client):
    response = client.get(reverse('home'))
    assert response.status_code == 200

# Check if the create_recipe page loads
@pytest.mark.django_db
def test_create_recipe_loads(client):
    response = client.get(reverse('create_recipe'))
    assert response.status_code == 200

# Check if the login page loads
@pytest.mark.django_db
def test_login_loads(client):
    response = client.get(reverse('login'))
    assert response.status_code == 200

# Check if the create_recipe page loads
@pytest.mark.django_db
def test_register_loads(client):
    response = client.get(reverse('register'))
    assert response.status_code == 200
