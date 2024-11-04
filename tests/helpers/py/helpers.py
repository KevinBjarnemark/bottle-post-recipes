from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

# NOTE Do not add anything that is declared in the backend,
# like 'vegan', recipe_type, etc.
MOCKRECIPEDATA = {
    "recipes": [
        {
            "id": 1,
            "user_id": 0,
            "title": "Vegan Recipe",
            "vegan": True,
            "recipe_type": "vegan",
            "description": "Test description",
            "instructions": "Test instructions",
            "dietary_attributes": ["soy"],
            "ingredients": [
                {"name": "Kale", "quantity": "3 handfuls of"},
                {"name": "Olive oil", "quantity": "1/4 cup of"},
            ],
            "bottle_posted_count": 5,
            "image": None,
            "in_ocean": True,
            "user_image": None,
            "comments": [
                {
                    "user": "Test user",
                    "text": "Test comment",
                    "created_at": "2024-01-01 00 00 00",
                }
            ],
        },
        {
            "id": 2,
            "user_id": 0,
            "recipe_type": "vegetarian",
            "vegan": False,
            "title": "Vegetarian Recipe",
            "description": "Test description",
            "instructions": "Test instructions",
            "dietary_attributes": ["meat"],
            "ingredients": [
                {"name": "Mozzarella", "quantity": "100g"},
                {"name": "Olive oil", "quantity": "1/4 cup of"},
            ],
            "bottle_posted_count": 5,
            "image": None,
            "in_ocean": True,
            "user_image": None,
            "comments": [],
        },
        {
            "id": 3,
            "user_id": 0,
            "recipe_type": "fish",
            "vegan": False,
            "title": "Fish Recipe",
            "description": "Test description",
            "instructions": "Test instructions",
            "dietary_attributes": ["fish"],
            "ingredients": [
                {"name": "Salmon", "quantity": "300g"},
                {"name": "Olive oil", "quantity": "1/4 cup of"},
            ],
            "bottle_posted_count": 5,
            "image": None,
            "in_ocean": True,
            "user_image": None,
            "comments": [
                {
                    "user": "Test user",
                    "text": "Test comment",
                    "created_at": "2024-01-01 00 00 00",
                }
            ],
        },
        {
            "id": 4,
            "user_id": 0,
            "recipe_type": "meat",
            "vegan": False,
            "title": "Meat Recipe",
            "description": "Test description",
            "instructions": "Test instructions",
            "dietary_attributes": ["meat"],
            "ingredients": [
                {"name": "Chicken", "quantity": "300g"},
                {"name": "Olive oil", "quantity": "1/4 cup of"},
            ],
            "bottle_posted_count": 5,
            "image": None,
            "in_ocean": True,
            "user_image": None,
            "comments": [
                {
                    "user": "Test user",
                    "text": "Test comment",
                    "created_at": "2024-01-01 00 00 00",
                }
            ],
        },
    ],
    "success": True,
    "error": "",
    "total_recipes": 4,
    "batch": 6,
}


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
