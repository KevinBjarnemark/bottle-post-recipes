import pytest
from django.urls import reverse


# Test all pages
@pytest.mark.django_db
def test_pages(client):
    pages = [
        'home',
        'log_in',
        'about',
        'account_registration',
        'terms_of_service',
        'privacy_policy',
    ]
    for page in pages:
        response = client.get(reverse(page))
        assert response.status_code == 200
