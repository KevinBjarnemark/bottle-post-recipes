import pytest
from django.urls import reverse
from pages.home.models import Test

# Check if the homepage loads
@pytest.mark.django_db
def test_homepage_loads(client):
    response = client.get(reverse('home'))
    assert response.status_code == 200

# Check if the homepage is using the base template
@pytest.mark.django_db
def test_homepage_uses_base_template(client):
    Test.objects.create(test="Local test!")
    response = client.get(reverse('home'))
    assert 'base.html' in [t.name for t in response.templates]
    assert '<h1>' in response.content.decode('utf-8')

# Check if homepage renders 'Local test!'
@pytest.mark.django_db
def test_homepage_renders_correctly(client):
    Test.objects.create(test="Local test!")
    response = client.get(reverse('home'))
    print(response.content.decode('utf-8')) 
    assert "Local test!" in response.content.decode('utf-8')
