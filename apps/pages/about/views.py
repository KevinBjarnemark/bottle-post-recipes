from django.shortcuts import render


def about(request):

    return render(request, 'pages/about/about.html')
