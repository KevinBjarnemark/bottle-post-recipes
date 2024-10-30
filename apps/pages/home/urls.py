from django.urls import path
from .views import (
    home,
    load_recipes,
    publish_comment,
    submit_bottle_post_review
)


urlpatterns = [
    path('', home, name='home'),
    path('load_recipes/', load_recipes, name='load_recipes'),
    path('publish_comment/', publish_comment, name='publish_comment'),
    path(
        'submit_bottle_post_review/',
        submit_bottle_post_review,
        name='submit_bottle_post_review'
    ),
]
