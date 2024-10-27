from django.http import JsonResponse
from .models import (
    DietaryAttribute, Recipe, Ingredient, Time,
    EstimatedPricePerMeal
)
from django.views.decorators.csrf import csrf_exempt
import json
from constants import NON_VEGAN_ATTRIBUTES


@csrf_exempt
def submit_recipe(request):
    """Creates a recipe"""

    if request.method == 'POST':
        try:
            # Text fields
            title = request.POST.get('title')
            description = request.POST.get('description')
            instructions = request.POST.get('instructions')
            tags = request.POST.get('tags')
            # Recipe image
            image = request.FILES.get('image')
            # Handle dietary attributes and determine if the recipe is vegan
            dietary_attributes = json.loads(
                request.POST.get('dietary_attributes', '[]')
            )

            # Determine recipe type
            recipe_type = "vegan"  # Default to vegan
            for attribute in dietary_attributes:
                if attribute in NON_VEGAN_ATTRIBUTES:
                    recipe_type = "vegetarian"
                if attribute == "fish" and not ("meat" in dietary_attributes):
                    recipe_type = "fish"
                if attribute == "meat":
                    recipe_type = "meat"
                    break

            vegan = True
            if not recipe_type == "vegan":
                vegan = False

            # Create the Recipe object
            recipe = Recipe(
                user=request.user,  # Ensure the user is logged in
                title=title,
                description=description,
                instructions=instructions,
                tags=tags,
                image=image,
                vegan=vegan,
                recipe_type=recipe_type,
            )
            recipe.save()

            # Save dietary attributes to the recipe
            for dietry_attribute in dietary_attributes:
                dietry_attribute, created = (
                    DietaryAttribute.objects.get_or_create(
                        name=dietry_attribute
                    )
                )
                recipe.dietary_attributes.add(dietry_attribute)

            # Save ingredients (not related to dietary attributes)
            ingredients = json.loads(request.POST.get('ingredients', '[]'))
            for ingredient in ingredients:
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ingredient['name'],
                    quantity=ingredient['quantity']
                )

            # Handle cooking and preparation time
            preparation_time = json.loads(
                request.POST.get('preparation_time', '{}')
            )
            cooking_time = json.loads(request.POST.get('cooking_time', '{}'))
            Time.objects.create(
                recipe=recipe,
                preparation_minutes=preparation_time.get('minutes', 0),
                preparation_hours=preparation_time.get('hours', 0),
                preparation_days=preparation_time.get('days', 0),
                cooking_minutes=cooking_time.get('minutes', 0),
                cooking_hours=cooking_time.get('hours', 0),
                cooking_days=cooking_time.get('days', 0),
            )

            # Handle estimated price
            estimated_price = json.loads(
                request.POST.get('estimated_price', '{}')
            )
            EstimatedPricePerMeal.objects.create(
                recipe=recipe,
                price_from=estimated_price.get('from', 0),
                price_to=estimated_price.get('to', 0)
            )

        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': True})
