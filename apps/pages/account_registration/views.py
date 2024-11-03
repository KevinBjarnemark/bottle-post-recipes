from django.shortcuts import render
# Django's built-in authentication
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
# Import profile model
from apps.users.models import Profile
from static.py.json_responses import throw_error, success


def register_account(request):
    try:
        if request.method == 'POST':
            form = UserCreationForm(request.POST, request.FILES)
            # Validate form
            if not form.is_valid():
                # Get the first error message
                first_error = next(iter(form.errors.values()))[0]
                return throw_error(first_error)

            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            profile_image = request.FILES.get('image')

            # Validate profile image
            if profile_image:
                valid_extensions = ['jpg', 'jpeg', 'png', 'webp']
                extension = profile_image.name.split('.')[-1].lower()
                if extension not in valid_extensions:
                    return throw_error(
                        "Invalid image format. Only JPG, "
                        "JPEG, and PNG are allowed."
                    )

            # Authenticate
            user = authenticate(username=username, password=password)
            # Handle the Profile object and associate the image

            profile, created = Profile.objects.get_or_create(user=user)
            if profile_image:
                profile.image = profile_image
            profile.save()
            # Automatically opt in the user and redirect to home
            login(request, user)
            return success()
        else:
            return throw_error("Invalid request")
    except Exception as e:
        print(e)
        return throw_error("Something went wrong")


def account_registration(request):

    return render(
        request,
        'pages/account_registration/account_registration.html'
    )
