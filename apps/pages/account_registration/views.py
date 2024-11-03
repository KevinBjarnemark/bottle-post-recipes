from django.shortcuts import render, redirect
# Django's built-in authentication
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
# Import profile model
from apps.users.models import Profile
from django.contrib import messages
from django.http import JsonResponse


def throw_error(error):
    """
    Returns an basic error dictionary.
    {'success': False, 'error': error}
    """
    return JsonResponse({
        'success': False,
        'error': (
            error
        )
    })


def register_account(request):
    try:
        if request.method == 'POST':
            form = UserCreationForm(request.POST, request.FILES)
            if form.is_valid():
                user = form.save()
                username = form.cleaned_data.get('username')
                password = form.cleaned_data.get('password1')
                
                if len(username) == 0:
                    throw_error("Username is missing")

                user = authenticate(username=username, password=password)
                # Handle the Profile object and associate the image
                profile_image = request.FILES.get('image')
                profile, created = Profile.objects.get_or_create(user=user)
                if profile_image:
                    profile.image = profile_image
                profile.save()
                # Automatically opt in the user and redirect to home
                login(request, user)
                messages.success(request, 'Your account has been created!')
                return redirect('home')
            else:
                return JsonResponse({
                        'success': False,
                        'error': (
                            'Form is invalid'
                        )
                    })
        else:
            form = UserCreationForm()
        return render(request, 'users/register.html', {'form': form})
    except Exception:
        throw_error("Something went wrong")


def account_registration(request):

    return render(
        request,
        'pages/account_registration/account_registration.html'
    )
