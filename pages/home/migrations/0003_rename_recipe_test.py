# Generated by Django 5.1 on 2024-08-16 15:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0002_recipe_delete_test'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Recipe',
            new_name='Test',
        ),
    ]