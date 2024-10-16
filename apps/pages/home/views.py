from django.shortcuts import render
from apps.users.models import Profile
from apps.pages.create_recipe.models import Recipe
import json
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q

def load_user_profile(request):
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


def load_recipes(request):
    """Loads public recipes in batches and order in 
    the following order: 
    
    bottle_posted_count, likes, created_at"""

    batch = 6
    page_number = request.GET.get('page')
    q = request.GET.get('q') # Query
    q_search_areas = request.GET.get('search_areas')

    if q_search_areas:
        # Split search_areas into a list (e.g., ['ingredients', 'tags'])
        include_areas = [field.strip() for field in q_search_areas.split(',') if field.strip()]

    query_filter = Q()
    if q:
        query_filter |= Q(title__icontains=q)
    if q_search_areas:
        if 'description' in include_areas:
            query_filter |= Q(description__icontains=q)
            print(include_areas)
        if 'ingredients' in include_areas:
            query_filter |= Q(ingredients__name__icontains=q)
        if 'tags' in include_areas:
            query_filter |= Q(tags__icontains=q)

    # Apply filters and prevent duplicate search results with distinct
    recipes = Recipe.objects.filter(query_filter).distinct()

    # NOTE! Do not remove '-created' at as it is ensuring consistent 
    # order and may cause duplicated search results 
    recipes = recipes.order_by('-bottle_posted_count', '-likes', '-created_at')

    total_recipes = recipes.count()
    paginator = Paginator(recipes, batch)  
    page = paginator.get_page(page_number)

    # Send necessary fields for frontend rendering
    data = [
        {
            'id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'bottle_posted_count': recipe.bottle_posted_count,
            'likes': recipe.likes,
            'in_ocean': recipe.in_ocean,
            'image': recipe.image.url if recipe.image else None,
            'user_image': recipe.user.profile.image.url if recipe.user.profile.image else None,
            'vegan': recipe.vegan,
        }
        for recipe in page.object_list
    ]

    return JsonResponse(
        {
            'recipes' : data, 
            'total_recipes': total_recipes,
            'batch': batch,
        }, 
        safe=False
    )

def home(request):
    user_profile = load_user_profile(request)

    return render(request, 'pages/home/home.html', 
        {
            'vegan_mode': user_profile['vegan_mode'],
            'user_profile': json.dumps(user_profile),
        }
    )
