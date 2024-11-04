import pytest
from django.urls import reverse
from tests.helpers.py.helpers import user_log_in


# Check if the homepage is using correct templates as a guest
@pytest.mark.django_db
def test_homepage_uses_correct_templates_guest(client):
    response = client.get(reverse('home'))
    templates_used = [t.name for t in response.templates]
    # Should render
    assert 'base.html' in templates_used
    assert 'components/page/hint_window.html' in templates_used
    assert 'components/user/login_required.html' in templates_used
    assert 'components/page/sidebar.html' in templates_used


# Check if the homepage is using correct templates as a user
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
    assert 'components/page/recipe_viewer.html' in templates_used
    assert 'components/page/recipe_editor.html' in templates_used
    assert (
        'components/buttons/bottle_post_notification_button.html'
        in templates_used)
    # Should not render
    assert 'components/user/login_required.html' not in templates_used


# Make sure feed.js is loaded for users
@pytest.mark.django_db
def test_js_feed_file_inclusion_user(client):
    user_log_in(client)
    response = client.get(reverse('home'))
    assert 'js/feed/feed.js' in response.content.decode()


# Make sure feed.js is not loaded for guests
@pytest.mark.django_db
def test_js_feed_file_exclusion_guest(client):
    response = client.get(reverse('home'))
    assert 'js/feed.js' not in response.content.decode()
