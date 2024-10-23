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

    # Load 6 recipes per 'page'
    BATCH = 6
    # URL parameters
    page_number = request.GET.get('page')
    q = request.GET.get('q')  # Query
    search_areas = request.GET.get('search_areas')
    recipe_types_exclude = request.GET.get('recipe_types_exclude')

    # Make sure q is declared and then create a query filter
    if not q:
        q = ""
    query_filter = Q()
    if q:
        query_filter |= Q(title__icontains=q)

    # Apply search areas
    if search_areas:
        # Split search_areas into a list (e.g., ['ingredients', 'tags'])
        search_areas = search_areas.split(',')
        if 'description' in search_areas:
            query_filter |= Q(description__icontains=q)
        if 'ingredients' in search_areas:
            query_filter |= Q(ingredients__name__icontains=q)
        if 'tags' in search_areas:
            query_filter |= Q(tags__icontains=q)

    # Exclude recipe types
    if recipe_types_exclude:
        exclude_types = recipe_types_exclude.split(',')
        if exclude_types:
            query_filter &= ~Q(recipe_type__in=exclude_types)

    # Apply filters and prevent duplicate search results with distinct
    recipes = Recipe.objects.filter(query_filter).distinct()

    # NOTE! Do not remove '-created' at as it is ensuring consistent
    # order and may cause duplicated search results
    recipes = recipes.order_by('-bottle_posted_count', '-likes', '-created_at')

    total_recipes = recipes.count()
    paginator = Paginator(recipes, BATCH)
    page = paginator.get_page(page_number)

    # Send necessary fields for frontend rendering
    data = [
        {
            'id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'instructions': recipe.instructions,
            'dietary_attributes': [
                attr.name for attr in recipe.dietary_attributes.all()
            ],
            'ingredients': [
                {
                    'name': ingredient.name, 'quantity': ingredient.quantity
                } 
                for ingredient in recipe.ingredients.all()
            ],
            'bottle_posted_count': recipe.bottle_posted_count,
            'likes': recipe.likes,
            'in_ocean': recipe.in_ocean,
            'image': recipe.image.url if recipe.image else None,
            'user_image': (
                recipe.user.profile.image.url
                if recipe.user.profile.image
                else None
            ),
            'vegan': recipe.vegan,
        }
        for recipe in page.object_list
    ]

    return JsonResponse(
        {
            'recipes': data,
            'total_recipes': total_recipes,
            'batch': BATCH,
        },
        safe=False
    )


def home(request):
    user_profile = load_user_profile(request)

    return render(request, 'pages/home/home.html', {
            'vegan_mode': user_profile['vegan_mode'],
            'user_profile': json.dumps(user_profile),
        }
    )
