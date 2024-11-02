from django.shortcuts import render


def terms_of_service(request):
    return render(request, 'pages/terms_of_service/terms_of_service.html')
