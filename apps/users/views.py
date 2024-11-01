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
import random
from apps.pages.home.models import Recipe


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


def load_user_profile(request):
    # Default profile
    user_profile = {
        'vegan_mode': False,
        'review_recipe_id': None,
    }
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
        # Get a random recipe if the user is allowed to review
        if profile.can_review():
            # Get all recipe ids
            recipe_ids = Recipe.objects.filter(
                in_ocean=True).values_list('id', flat=True)
            # User's review_recipe_id is None
            is_none = profile.review_recipe_id is None
            # User has an assigned review_recipe_id, but the recipe
            # doesn't exist in the database anymore
            exists_but_should_be_replaced = (
                (profile.review_recipe_id == 0 or profile.review_recipe_id)
                and profile.review_recipe_id not in recipe_ids
            )
            if is_none or exists_but_should_be_replaced:
                # Add a review_recipe_id if it should be added/replaced
                if recipe_ids:  # Ensure there are recipes available
                    random_recipe_id = random.choice(recipe_ids)
                    profile.review_recipe_id = random_recipe_id
                    profile.save()
        else:
            # Make sure they are locked from reviewing
            profile.review_recipe_id = None
            profile.save()

        user_profile = {
            'user_id': profile.user.id,
            'username': profile.user.username,
            'vegan_mode': profile.vegan_mode,
            'review_recipe_id': profile.review_recipe_id,
        }
    return user_profile


@csrf_exempt
def delete_account(request):
    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse(
                {'error': 'User not authenticated'}, status=403
            )

        data = json.loads(request.body)
        password = data.get('password')

        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)

        # Authenticate with password
        user = authenticate(username=request.user.username, password=password)
        if user is None:
            return JsonResponse({'error': 'Incorrect password'}, status=403)

        try:
            # Delete the user account and profile
            user.delete()
            return JsonResponse({'success': 'Account deleted successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


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
