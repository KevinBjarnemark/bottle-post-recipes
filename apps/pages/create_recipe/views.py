from django.shortcuts import render


def create_recipe(request):
    return render(request, 'pages/create_recipe/create_recipe.html', {'test': 0})
