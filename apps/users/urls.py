
from django.urls import path
from .views import register, toggle_vegan_mode
# Djongo's built-in auth views
from django.contrib.auth import views as auth_views
# settings.py
from django.conf import settings
# Static files
from django.conf.urls.static import static

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(
        template_name='registration/login.html'), name='login'
    ),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', register, name='register'),
    path('toggle_vegan_mode/', toggle_vegan_mode, name='toggle_vegan_mode'),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )
