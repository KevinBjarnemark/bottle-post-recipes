from django.shortcuts import render, redirect
# Django's built-in authentication
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
# Import all profile model
from .models import Profile
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse


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


@csrf_exempt
def toggle_vegan_mode(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        vegan_mode = data.get('vegan_mode', True)
        profile = Profile.objects.get(user=request.user)
        profile.vegan_mode = vegan_mode
        profile.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'failed'}, status=400)
