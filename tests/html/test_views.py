import pytest
from django.urls import reverse


# Check if the homepage loads
@pytest.mark.django_db
def test_homepage_loads(client):
    response = client.get(reverse('home'))
    assert response.status_code == 200


# Check if the login page loads
@pytest.mark.django_db
def test_login_loads(client):
    response = client.get(reverse('log_in'))
    assert response.status_code == 200
