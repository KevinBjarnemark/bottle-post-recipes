from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

def user_log_in(client):
    # Create a test user and log in
    user = User.objects.create_user(username='testuser', password='testpassword')
    client.login(username='testuser', password='testpassword')
     # Create a mock image for the profile
    mock_image = SimpleUploadedFile(name='test_image.jpg', content=b'', content_type='image/jpeg')
    profile = user.profile
    profile.image = mock_image
    profile.save()