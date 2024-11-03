from django.http import JsonResponse


def success():
    """
    Returns an basic success object.
    {'success': True, 'error': ""}
    """
    return JsonResponse({
        'success': True,
        'error': "",
    })


def throw_error(error):
    """
    Returns an basic error object.
    {'success': False, 'error': error}
    """
    return JsonResponse({
        'success': False,
        'error': (
            error
        ),
    })
