from django.shortcuts import render
from apps.users.models import Profile
import json
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponseForbidden
from django.db.models import Q
from .models import (
    DietaryAttribute, Recipe, Ingredient, Time,
    EstimatedPricePerMeal, Comment
)
from constants import NON_VEGAN_ATTRIBUTES
from apps.users.views import load_user_profile
from django.contrib.auth import authenticate


def submit_bottle_post_review(request):
    """Handles bottle post reviews"""

    if request.method == 'POST' and request.user.is_authenticated:
        action = request.GET.get('action')
        try:
            # Get user profile
            profile = Profile.objects.get(user=request.user)

            # Check if the user has an assigned review_recipe_id
            review_recipe_id = profile.review_recipe_id
            recipe_id_exists = review_recipe_id == 0 or review_recipe_id
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
                # Delete or return recipe to ocean
                if action == "DELETE":
                    recipe.remove_from_ocean()
                elif action == "BOTTLE_POST":
                    recipe.return_to_ocean()

                # Update last_reviewed_at timestamp
                profile.update_review_timestamp()

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


def load_recipes(request):
    """
    Loads public recipes in batches and order them in
    the following order:

    bottle_posted_count, likes, created_at

    Note, likes are integrated but not implemented yet.
    """

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
            'username': recipe.user.username,
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


def delete_recipe(request):
    """Deletes a recipe from the database"""
    if request.method == 'DELETE':
        try:
            # Retrieve recipe_id and validate ownership
            recipe_id = request.GET.get('recipe_id')
            data = json.loads(request.body)
            password = data.get('password')
            if not password:
                return JsonResponse(
                    {'error': 'Password is required'}, status=400
                )

            # Authorize user
            user = request.user
            if not user.is_authenticated:
                return JsonResponse(
                    {'error': 'User not authenticated'}, status=403
                )

            # Authenticate user with password
            user = authenticate(username=user.username, password=password)
            if user is None:
                return JsonResponse(
                    {'error': 'Incorrect password'}, status=403
                )

            # Validate url parameter (recipe_id)
            if not recipe_id:
                return JsonResponse({
                    'success': False,
                    'error': 'Recipe ID is required for deletion.'
                })

            # Get the recipe and ensure the current user is the owner
            recipe = Recipe.objects.get(id=recipe_id)
            if recipe.user != request.user:
                return HttpResponseForbidden(
                    "You do not have permission to delete this recipe."
                )

            # Delete the recipe
            recipe.delete()
            return JsonResponse(
                {'success': True, 'message': 'Recipe deleted successfully.'}
            )

        except Recipe.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Recipe not found.'
            })
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'error': str(e)})


def submit_recipe(request):
    """
    Creates or updates a recipe based on how recipe_id is constructed.
    """

    if request.method == 'POST':
        try:
            # Check if this is an edit (update) or create operation
            recipe_id = request.POST.get('recipe_id')
            is_update = recipe_id is not None and recipe_id != "NEW RECIPE"

            # Update if it's a new recipe and update if it already exist
            if is_update:
                # Retrieve the recipe to edit
                recipe = Recipe.objects.get(id=recipe_id)
                # Check if the current user is the author of the recipe
                if recipe.user != request.user:
                    return HttpResponseForbidden(
                        "You do not have permission to edit this recipe."
                    )
            else:
                # Block spammy requests (24 hour limit)
                profile = Profile.objects.get(user=request.user)
                if not profile.can_post():
                    return HttpResponseForbidden(
                        "You must wait 24 hours between each post."
                    )

                # Create a new recipe for the current user
                recipe = Recipe(user=request.user)

            # Update fields as necessary
            recipe.title = request.POST.get('title')
            recipe.description = request.POST.get('description')
            recipe.instructions = request.POST.get('instructions')
            recipe.tags = request.POST.get('tags')

            # Update image if provided
            if image := request.FILES.get('image'):
                recipe.image = image

            # Handle dietary attributes and determine if the recipe is vegan
            dietary_attributes = json.loads(request.POST.get(
                'dietary_attributes', '[]')
            )
            recipe_type = "vegan"  # Default to vegan
            for attribute in dietary_attributes:
                if attribute in NON_VEGAN_ATTRIBUTES:
                    recipe_type = "vegetarian"
                if attribute == "fish" and not ("meat" in dietary_attributes):
                    recipe_type = "fish"
                if attribute == "meat":
                    recipe_type = "meat"
                    break

            recipe.vegan = recipe_type == "vegan"
            recipe.recipe_type = recipe_type

            # Save or update the Recipe object
            recipe.save()

            # Update dietary attributes
            recipe.dietary_attributes.clear()
            for dietry_attribute in dietary_attributes:
                dietry_attribute, _ = DietaryAttribute.objects.get_or_create(
                    name=dietry_attribute
                )
                recipe.dietary_attributes.add(dietry_attribute)

            # Update ingredients
            recipe.ingredients.all().delete()  # Clear existing ingredients
            ingredients = json.loads(request.POST.get('ingredients', '[]'))
            for ingredient in ingredients:
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ingredient['name'],
                    quantity=ingredient['quantity']
                )

            # Update or create cooking and preparation time
            preparation_time = json.loads(
                request.POST.get('preparation_time', '{}')
            )
            cooking_time = json.loads(request.POST.get('cooking_time', '{}'))
            time, _ = Time.objects.get_or_create(recipe=recipe)
            time.update_preparation_time(
                preparation_time.get('days', 0),
                preparation_time.get('hours', 0),
                preparation_time.get('minutes', 0),
            )
            time.update_cooking_time(
                cooking_time.get('days', 0),
                cooking_time.get('hours', 0),
                cooking_time.get('minutes', 0),
            )

            # Update or create estimated price
            estimated_price = json.loads(
                request.POST.get('estimated_price', '{}')
            )
            price, _ = EstimatedPricePerMeal.objects.get_or_create(
                recipe=recipe
            )
            price.update_estimated_price(
                estimated_price.get('from', 0),
                estimated_price.get('to', 0)
            )

            # Update last_posted_at timestamp
            profile.update_last_posted_timestamp()

        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': True})


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
