from django.shortcuts import render


def privacy_policy(request):
    return render(request, 'pages/privacy_policy/privacy_policy.html')
