# Generated by Django 5.1 on 2024-10-31 09:19

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('home', '0004_delete_test'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DietaryAttribute',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('recipe_type', models.CharField(choices=[('vegan', 'Vegan'), ('vegetarian', 'Vegetarian'), ('fish', 'Fish'), ('meat', 'Meat')], max_length=50)),
                ('title', models.CharField(max_length=255)),
                ('image', models.ImageField(blank=True, null=True, upload_to='recipe_images/')),
                ('description', models.TextField()),
                ('likes', models.IntegerField(default=0)),
                ('bottle_posted_count', models.IntegerField(default=0)),
                ('in_ocean', models.BooleanField(default=True)),
                ('public', models.BooleanField(default=True)),
                ('vegan', models.BooleanField(default=False)),
                ('tags', models.CharField(blank=True, max_length=255, null=True)),
                ('instructions', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_edited', models.DateTimeField(auto_now=True)),
                ('dietary_attributes', models.ManyToManyField(blank=True, related_name='recipes', to='home.dietaryattribute')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Ingredient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.CharField(max_length=50)),
                ('name', models.CharField(max_length=255)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingredients', to='home.recipe')),
            ],
        ),
        migrations.CreateModel(
            name='EstimatedPricePerMeal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price_from', models.DecimalField(decimal_places=2, max_digits=6)),
                ('price_to', models.DecimalField(decimal_places=2, max_digits=6)),
                ('recipe', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='estimated_price', to='home.recipe')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='home.recipe')),
            ],
        ),
        migrations.CreateModel(
            name='Time',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('preparation_minutes', models.IntegerField(default=0)),
                ('preparation_hours', models.IntegerField(default=0)),
                ('preparation_days', models.IntegerField(default=0)),
                ('cooking_minutes', models.IntegerField(default=0)),
                ('cooking_hours', models.IntegerField(default=0)),
                ('cooking_days', models.IntegerField(default=0)),
                ('recipe', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='time', to='home.recipe')),
            ],
        ),
    ]
