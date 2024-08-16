from django.shortcuts import render
from .models import Test

def home(request):
    test_data = Test.objects.all()
    return render(request, 'pages/home/home.html', {'test_data': test_data})
