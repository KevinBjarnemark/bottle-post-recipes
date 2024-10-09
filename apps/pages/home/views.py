from django.shortcuts import render
from apps.users.models import Profile
from apps.pages.create_recipe.models import Recipe
import json
from django.core.serializers import serialize

def get_user_profile(request):
    # Default profile
    user_profile = {
        'vegan_mode': False,
    }
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
        user_profile = {
            'vegan_mode': profile.vegan_mode,
        }
    return user_profile

def home(request):
    recipes = Recipe.objects.all()
    user_profile = get_user_profile(request)

    recipes_json = serialize('json', recipes)
    
    
    return render(request, 'pages/home/home.html', 
        {
            'vegan_mode': user_profile['vegan_mode'],
            'user_profile': json.dumps(user_profile),
            'recipes': recipes,
            'recipesJSON': json.dumps(recipes_json),
        }
    )
