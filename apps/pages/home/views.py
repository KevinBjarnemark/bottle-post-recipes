from django.shortcuts import render
from apps.users.models import Profile
from apps.pages.create_recipe.models import Recipe, Comment
import json
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
import random
from django.utils import timezone


def submit_bottle_post_review(request):
    """Handles bottle post reviews"""

    if request.method == 'POST' and request.user.is_authenticated:
        action = request.GET.get('action')
        try:
            # Get user profile
            profile = Profile.objects.get(user=request.user)
            # Check if the user has an assigned review_recipe_id
            recipe_id_exists = (
                profile.review_recipe_id == 0 or profile.review_recipe_id
            )
            if not recipe_id_exists:
                return JsonResponse({
                    'success': False,
                    'error': (
                        'You do not have permission to delete this recipe.'
                    )
                })
            if profile.can_review() and recipe_id_exists:
                # Get the recipe by id
                recipe = Recipe.objects.get(id=profile.review_recipe_id)
                if action == "DELETE":
                    # Remove the recipe from ocean if the user is allowed
                    recipe.in_ocean = False
                    recipe.save()
                elif action == "BOTTLE_POST":
                    # Increment bottle_posted_count
                    recipe.bottle_posted_count = recipe.bottle_posted_count + 1
                    recipe.save()
                # Update last_reviewed_at_value
                profile.last_reviewed_at = timezone.now()
                profile.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Bottle post review was successful.'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': (
                        'You do not have permission to review this recipe.'
                    )
                })
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'error': str(e)})


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
            recipe_ids = Recipe.objects.values_list('id', flat=True)
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
    print(user_profile)
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
    # Only show recipes of a certain id
    user_id = request.GET.get('user_id')
    # Show a specific recipe
    recipe_id = request.GET.get('recipe_id')

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

    if user_id:
        query_filter &= Q(user__id=user_id)

    if recipe_id:
        query_filter &= Q(id=recipe_id)

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
            'user_id': recipe.user.id,
            'title': recipe.title,
            'description': recipe.description,
            'instructions': recipe.instructions,
            'tags': recipe.tags,
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
            'preparation_time': [
                {
                    'days': recipe.time.preparation_days,
                    'hours': recipe.time.preparation_hours,
                    'minutes': recipe.time.preparation_minutes,
                }
            ],
            'cooking_time': [
                {
                    'days': recipe.time.cooking_days,
                    'hours': recipe.time.cooking_hours,
                    'minutes': recipe.time.cooking_minutes,
                }
            ],
            'estimated_price': [{
                'from': float(recipe.estimated_price.price_from) if hasattr(
                    recipe, 'estimated_price') else 0.0,
                'to': float(recipe.estimated_price.price_to) if hasattr(
                    recipe, 'estimated_price') else 0.0,
            }],
            'comments': [
                {
                    'user': comment.user.username,
                    'text': comment.text,
                    'created_at': comment.created_at.strftime(
                        '%Y-%m-%d %H:%M:%S'
                    )
                }
                for comment in recipe.comments.all().order_by('created_at')
            ],
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


@csrf_exempt
def publish_comment(request):
    if request.method == 'POST' and request.user.is_authenticated:
        try:
            # URL parameters
            recipe_id = request.POST.get('recipe_id')
            comment_text = request.POST.get('comment')

            # Fetch the recipe
            recipe = Recipe.objects.get(id=recipe_id)

            # Create the comment
            Comment.objects.create(
                recipe=recipe,
                user=request.user,
                text=comment_text
            )

            return JsonResponse({'success': True})

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'message': 'Invalid request'})


def home(request):
    user_profile = load_user_profile(request)

    return render(request, 'pages/home/home.html', {
            'vegan_mode': user_profile['vegan_mode'],
            'user_profile': json.dumps(user_profile),
        }
    )
