from django.http import JsonResponse, HttpResponseForbidden
from .models import (
    DietaryAttribute, Recipe, Ingredient, Time,
    EstimatedPricePerMeal
)
from django.views.decorators.csrf import csrf_exempt
import json
from constants import NON_VEGAN_ATTRIBUTES


@csrf_exempt
def submit_recipe(request):
    """Creates or updates a recipe based on presence of recipe_id."""

    if request.method == 'POST':
        try:
            # Check if this is an edit (update) or create operation
            recipe_id = request.POST.get('recipe_id')
            is_update = recipe_id is not None and recipe_id != "NEW RECIPE"

            if is_update:
                # Retrieve the recipe to edit
                recipe = Recipe.objects.get(id=recipe_id)
                # Check if the current user is the author of the recipe
                if recipe.user != request.user:
                    return HttpResponseForbidden(
                        "You do not have permission to edit this recipe."
                    )
            else:
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
            time.preparation_minutes = preparation_time.get('minutes', 0)
            time.preparation_hours = preparation_time.get('hours', 0)
            time.preparation_days = preparation_time.get('days', 0)
            time.cooking_minutes = cooking_time.get('minutes', 0)
            time.cooking_hours = cooking_time.get('hours', 0)
            time.cooking_days = cooking_time.get('days', 0)
            time.save()

            # Update or create estimated price
            estimated_price = json.loads(
                request.POST.get('estimated_price', '{}')
            )
            price, _ = EstimatedPricePerMeal.objects.get_or_create(
                recipe=recipe
            )
            price.price_from = estimated_price.get('from', 0)
            price.price_to = estimated_price.get('to', 0)
            price.save()

        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': True})
