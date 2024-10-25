from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

# NOTE Do not add anything that is declared in the backend,
# like 'vegan', recipe_type, etc.
MOCKRECIPEDATA = [
        {
            'id': 1,
            'title': "Vegan Recipe",
            'description': "Test description",
            'instructions': "Test instructions",
            'dietary_attributes': ["soy"],
            'ingredients': [
                {'name': "Kale", 'quantity': "3 handfuls of"},
                {'name': "Olive oil", 'quantity': "1/4 cup of"},
            ],
            'image': None,
            'tags': "healthy, fresh",
            'user_image': None,
            'user_image': None,
            'preparation_time': {
                'preparation-time-minutes': 0,
                'preparation-time-hours': 1,
                'preparation-time-days': 0,
            },
            'cooking_time': {
                'cooking-time-minutes': 20,
                'cooking-time-hours': 1,
                'cooking-time-days': 0,
            },
            'estimate_price': {
                'estimate-price-from': 20,
                'estimate-price-to': 40,
            },
        },
        {
            'id': 2,
            'title': "Vegetarian Recipe",
            'description': "Test description",
            'instructions': "Test instructions",
            'dietary_attributes': ["meat"],
            'ingredients': [
                {'name': "Mozzarella", 'quantity': "100g"},
                {'name': "Olive oil", 'quantity': "1/4 cup of"},
            ],
            'image': None,
            'tags': "summer, yummy",
            'user_image': None,
            'user_image': None,
            'preparation_time': {
                'preparation-time-minutes': 0,
                'preparation-time-hours': 1,
                'preparation-time-days': 0,
            },
            'cooking_time': {
                'cooking-time-minutes': 20,
                'cooking-time-hours': 1,
                'cooking-time-days': 0,
            },
            'estimate_price': {
                'estimate-price-from': 20,
                'estimate-price-to': 40,
            },
        },
        {
            'id': 3,
            'title': "Fish Recipe",
            'description': "Test description",
            'instructions': "Test instructions",
            'dietary_attributes': ["fish"],
            'ingredients': [
                {'name': "Salmon", 'quantity': "300g"},
                {'name': "Olive oil", 'quantity': "1/4 cup of"},
            ],
            'image': None,
            'tags': "dinner",
            'user_image': None,
            'user_image': None,
            'preparation_time': {
                'preparation-time-minutes': 0,
                'preparation-time-hours': 1,
                'preparation-time-days': 0,
            },
            'cooking_time': {
                'cooking-time-minutes': 20,
                'cooking-time-hours': 1,
                'cooking-time-days': 0,
            },
            'estimate_price': {
                'estimate-price-from': 20,
                'estimate-price-to': 40,
            },
        },
        {
            'id': 4,
            'title': "Meat Recipe",
            'description': "Test description",
            'instructions': "Test instructions",
            'dietary_attributes': ["meat"],
            'ingredients': [
                {'name': "Chicken", 'quantity': "300g"},
                {'name': "Olive oil", 'quantity': "1/4 cup of"},
            ],
            'image': None,
            'tags': "",
            'user_image': None,
            'user_image': None,
            'preparation_time': {
                'preparation-time-minutes': 0,
                'preparation-time-hours': 1,
                'preparation-time-days': 0,
            },
            'cooking_time': {
                'cooking-time-minutes': 20,
                'cooking-time-hours': 1,
                'cooking-time-days': 0,
            },
            'estimate_price': {
                'estimate-price-from': 20,
                'estimate-price-to': 40,
            },
        },
]


def create_mock_image():
    return SimpleUploadedFile(
        name='test_image.jpg', content=b'', content_type='image/jpeg'
    )


def user_log_in(client):
    # Create a test user and log in
    user = User.objects.create_user(
        username='testuser', password='testpassword'
    )
    client.login(username='testuser', password='testpassword')
    # Create a mock image for the profile
    mock_image = create_mock_image()
    profile = user.profile
    profile.image = mock_image
    profile.save()
    return user
