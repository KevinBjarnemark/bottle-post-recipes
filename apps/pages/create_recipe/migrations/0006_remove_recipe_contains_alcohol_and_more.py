# Generated by Django 5.1 on 2024-10-20 11:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('create_recipe', '0005_dietaryattribute_recipe_dietary_attributes'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recipe',
            name='contains_alcohol',
        ),
        migrations.RemoveField(
            model_name='recipe',
            name='contains_dairy',
        ),
    ]
