from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class DietaryAttribute(models.Model):
    """
    This model is related to the Recipe model.
    Stores dietary attributes included in a recipe.
    """
    # e.g., 'Alcohol', 'Dairy', 'Gluten'
    name = models.CharField(max_length=50, unique=True)

    # Ensure ingredients are displayed in admn portal
    def __str__(self):
        return self.name


class Recipe(models.Model):
    """
    Represents a recipe and serves as the central model
    connecting various other models, such as ingredients, comments,
    dietary attributes, and preparation details.
    """

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    RECIPE_TYPES = [
        ('vegan', 'Vegan'),
        ('vegetarian', 'Vegetarian'),
        ('fish', 'Fish'),
        ('meat', 'Meat'),
    ]
    recipe_type = models.CharField(max_length=50, choices=RECIPE_TYPES)
    title = models.CharField(max_length=255)
    if settings.DEBUG:
        image = models.ImageField(
            upload_to='recipe_images/', blank=True, null=True
        )
    else:
        image = CloudinaryField('image', blank=True, null=True)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    bottle_posted_count = models.IntegerField(default=0)
    in_ocean = models.BooleanField(default=True)
    public = models.BooleanField(default=True)
    dietary_attributes = models.ManyToManyField(
        DietaryAttribute, blank=True, related_name='recipes'
    )
    vegan = models.BooleanField(default=False)
    tags = models.CharField(max_length=255, null=True, blank=True)
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(auto_now=True)

    def return_to_ocean(self):
        """Returns the recipe to the ocean"""
        self.bottle_posted_count += 1
        self.save()

    def remove_from_ocean(self):
        """Removes the recipe from the coean"""
        self.in_ocean = False
        self.save()


class Ingredient(models.Model):
    """This model is related to the Recipe model"""

    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='ingredients'
    )
    quantity = models.CharField(max_length=50)
    name = models.CharField(max_length=255)


class Time(models.Model):
    """
    This model is related to the Recipe model.
    Stores preparation and cooking time data.
    """

    recipe = models.OneToOneField(
        Recipe, on_delete=models.CASCADE, related_name='time'
    )
    preparation_minutes = models.IntegerField(default=0)
    preparation_hours = models.IntegerField(default=0)
    preparation_days = models.IntegerField(default=0)
    cooking_minutes = models.IntegerField(default=0)
    cooking_hours = models.IntegerField(default=0)
    cooking_days = models.IntegerField(default=0)

    def update_preparation_time(self, days, hours, minutes):
        """Updates preparation time (days, hours, minutes)"""
        self.preparation_days = days
        self.preparation_hours = hours
        self.preparation_minutes = minutes
        self.save()

    def update_cooking_time(self, days, hours, minutes):
        """Updates cooking time (days, hours, minutes)"""
        self.cooking_days = days
        self.cooking_hours = hours
        self.cooking_minutes = minutes
        self.save()


class EstimatedPricePerMeal(models.Model):
    """
    This model is related to the Recipe model.
    Stores estimated price for a recipe.
    """
    recipe = models.OneToOneField(
        Recipe, on_delete=models.CASCADE, related_name='estimated_price'
    )
    price_from = models.DecimalField(null=True, max_digits=6, decimal_places=2)
    price_to = models.DecimalField(null=True, max_digits=6, decimal_places=2)

    def update_estimated_price(self, price_from, price_to):
        """Updates estimated time (price_from, price_to)"""
        self.price_from = price_from
        self.price_to = price_to
        self.save()


class Comment(models.Model):
    """
    This model is related to the Recipe model.
    Stores user commenting data.
    """
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='comments'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
