# Generated by Django 5.1 on 2024-09-12 19:46

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('likes', models.IntegerField(default=0)),
                ('bottle_posted_count', models.IntegerField(default=0)),
                ('in_ocean', models.BooleanField(default=True)),
                ('public', models.BooleanField(default=True)),
                ('contains_alcohol', models.BooleanField(default=False)),
                ('dairy', models.BooleanField(default=False)),
                ('vegan', models.BooleanField(default=False)),
                ('tags', models.CharField(blank=True, max_length=255, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='recipe_images/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_edited', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Instruction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('step_number', models.IntegerField()),
                ('content', models.TextField()),
                ('type', models.CharField(choices=[('text', 'Text'), ('ordered_list', 'Ordered List')], max_length=20)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='instructions', to='create_recipe.recipe')),
            ],
        ),
        migrations.CreateModel(
            name='Ingredient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.CharField(max_length=50)),
                ('name', models.CharField(max_length=255)),
                ('unit', models.CharField(max_length=20)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingredients', to='create_recipe.recipe')),
            ],
        ),
        migrations.CreateModel(
            name='EstimatedPricePerMeal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price_from', models.DecimalField(decimal_places=2, max_digits=6)),
                ('price_to', models.DecimalField(decimal_places=2, max_digits=6)),
                ('recipe', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='estimated_price', to='create_recipe.recipe')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('recipe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='create_recipe.recipe')),
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
                ('recipe', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='time', to='create_recipe.recipe')),
            ],
        ),
    ]