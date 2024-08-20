import pytest
from django.test import Client

@pytest.mark.django_db
def test_homepage_loads():
    client = Client()
    response = client.get('/')
    assert response.status_code == 200
