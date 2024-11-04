
import pytest
from tests.helpers.py.helpers import user_log_in
from django.urls import reverse
import json
from django.contrib.auth.models import User


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
