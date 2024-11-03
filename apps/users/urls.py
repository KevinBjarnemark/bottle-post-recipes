
from django.urls import path
from .views import toggle_vegan_mode, delete_account
# Djongo's built-in auth views
from django.contrib.auth import views as auth_views
# settings.py
from django.conf import settings
# Static files
from django.conf.urls.static import static

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(
        template_name='users/login.html'), name='login'
    ),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('toggle_vegan_mode/', toggle_vegan_mode, name='toggle_vegan_mode'),
    path('delete_account/', delete_account, name='delete_account'),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )
