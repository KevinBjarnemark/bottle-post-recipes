# Generated by Django 5.1 on 2024-10-30 10:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_profile_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='review_recipe_id',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]