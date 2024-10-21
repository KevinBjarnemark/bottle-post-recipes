from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField

class DietaryAttribute(models.Model):
    # e.g., 'Alcohol', 'Dairy', 'Gluten'
    name = models.CharField(max_length=50, unique=True)
    
    # Ensure ingredients are displayed in admn portal
    def __str__(self):
        return self.name

# Recipe models
class Recipe(models.Model):
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
        image = models.ImageField(upload_to='recipe_images/', blank=True, null=True)
    else:
        image = CloudinaryField('image', blank=True, null=True)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    bottle_posted_count = models.IntegerField(default=0)
    in_ocean = models.BooleanField(default=True)
    public = models.BooleanField(default=True)
    dietary_attributes = models.ManyToManyField(DietaryAttribute, blank=True, related_name='recipes')
    vegan = models.BooleanField(default=False)
    tags = models.CharField(max_length=255, null=True, blank=True)
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(auto_now=True)
    # Method of incrementing bottle_posted_count
    def bottle_post(self):
        self.bottle_posted_count += 1
        self.save()

class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    quantity = models.CharField(max_length=50)
    name = models.CharField(max_length=255)

class Time(models.Model):
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='time')
    preparation_minutes = models.IntegerField(default=0)
    preparation_hours = models.IntegerField(default=0)
    preparation_days = models.IntegerField(default=0)
    cooking_minutes = models.IntegerField(default=0)
    cooking_hours = models.IntegerField(default=0)
    cooking_days = models.IntegerField(default=0)

class EstimatedPricePerMeal(models.Model):
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='estimated_price')
    price_from = models.DecimalField(max_digits=6, decimal_places=2)
    price_to = models.DecimalField(max_digits=6, decimal_places=2)

class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
