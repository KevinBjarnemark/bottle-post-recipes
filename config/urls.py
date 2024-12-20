
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("__reload__/", include("django_browser_reload.urls")),
    path('admin/', admin.site.urls),
    path('', include('apps.pages.home.urls')),
    path('', include('apps.users.urls')),
    path('', include('apps.pages.about.urls')),
    path('', include('apps.pages.terms_of_service.urls')),
    path('', include('apps.pages.privacy_policy.urls')),
    path('', include('apps.pages.account_registration.urls')),
    path('', include('apps.pages.log_in.urls')),
]
