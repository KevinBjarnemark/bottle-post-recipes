from django.shortcuts import render
# Django's built-in authentication
from django.contrib.auth import login, authenticate
# Import profile model
from static.py.json_responses import throw_error, success


def submit_log_in(request):
    try:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')

            # Basic validation
            if not username or not password:
                return throw_error("Username and password are required.")

            # Authenticate user
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return success()
            else:
                return throw_error("Invalid username or password.")
        else:
            return throw_error("Invalid request method.")
    except Exception:
        return throw_error("Something went wrong.")


def log_in(request):

    return render(
        request,
        'pages/log_in/log_in.html'
    )
