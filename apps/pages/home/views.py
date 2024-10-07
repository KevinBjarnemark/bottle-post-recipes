from django.shortcuts import render
from .models import Test
from apps.users.models import Profile
from apps.pages.create_recipe.models import Recipe
import json

def get_user_profile(request):
    # Default profile
    user_profile = {
        'vegan_mode': False,
        'test': True,
    }
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
        user_profile = {
            'vegan_mode': profile.vegan_mode,
            'test': True,
        }
    return user_profile

def home(request):
    recipes = Recipe.objects.all()
    test_data = Test.objects.all()
    user_profile = get_user_profile(request)
    
    return render(request, 'pages/home/home.html', 
        {
            'test_data': test_data, 
            'user_profile': json.dumps(user_profile),
            'recipes': recipes,
        }
    )
