from django.shortcuts import render, redirect
# Django's built-in authentication
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib.auth.signals import user_logged_in
# Import all profile model
from .models import Profile
from django.dispatch import receiver
from django.contrib import messages

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            # TODO Form validation
            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
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
            print(form.errors)
            messages.error(request, "Please correct the error(s) below.")
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})
