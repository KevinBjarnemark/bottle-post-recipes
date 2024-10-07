from django.forms import modelformset_factory
from django.http import JsonResponse
from .models import Ingredient, Recipe
from .forms import RecipeForm, IngredientForm, TimeForm, EstimatedPricePerMealForm
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def create_recipe(request):
    form_data = [] # Collected data from models, used by create_recipe.js
    time_form = TimeForm()
    estimated_price_form = EstimatedPricePerMealForm()

    if request.method == 'POST':
        try:
            title = request.POST.get('title')
            description = request.POST.get('description')
            contains_alcohol = request.POST.get('contains_alcohol') == 'on'
            contains_dairy = request.POST.get('contains_dairy') == 'on'
            vegan = request.POST.get('vegan') == 'on'
            tags = request.POST.get('tags')
            instructions = request.POST.get('instructions')
            image = request.FILES.get('image')

            # Create the Recipe object
            recipe = Recipe(
                user=request.user, # Ensure the user is logged in
                title=title,
                description=description,
                contains_alcohol=contains_alcohol,
                contains_dairy=contains_dairy,
                vegan=vegan,
                tags=tags,
                instructions=instructions,
                image=image,
            )
            recipe.save()

            # Parse and save ingredients
            ingredients_data = json.loads(request.POST.get('ingredients', '[]'))
            for ingredient_data in ingredients_data:
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ingredient_data['name'],
                    quantity=ingredient_data['quantity'],
                )

            # Handle time form
            time_form = TimeForm(request.POST)
            if time_form.is_valid():
                time_instance = time_form.save(commit=False)
                time_instance.recipe = recipe  # Associate with the recipe
                time_instance.save()

            # Handle Estimated Price Form
            estimated_price_form = EstimatedPricePerMealForm(request.POST)
            if estimated_price_form.is_valid():
                price_instance = estimated_price_form.save(commit=False)
                price_instance.recipe = recipe  # Associate with the recipe
                price_instance.save()

            return JsonResponse({'success': True})
        except Exception as e:
            print("Error:", e)
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        recipe_form = RecipeForm()
        time_form = TimeForm()
        estimated_price_form = EstimatedPricePerMealForm()

        # Avoid repetition by referencing from source and then generate with js
        content = {
            field.name: {
                'label': field.label,
                'default_value': field.initial,
                'widget': {
                    'type': field.field.widget.__class__.__name__,
                    'attrs': field.field.widget.attrs,
                    'input_type': getattr(field.field.widget, 'input_type', None),
                },
            }
            for field in recipe_form
        }
        form_data.append(content)
        print(form_data)

        # Ingredients formset
        IngredientFormSet = modelformset_factory(Ingredient, form=IngredientForm)
        ingredient_formset = IngredientFormSet(queryset=Ingredient.objects.none())

    # Render with form data
    return render(request, 'pages/create_recipe/create_recipe.html', {
        'ingredient_formset': ingredient_formset,
        'time_form': time_form,
        'estimated_price_form': estimated_price_form,
        'form_data': json.dumps(form_data),
    })
