from main_app.models import User

def check_user_exists(username, email):
    if User.objects.filter(username=username).exists():
        return 1
    if User.objects.filter(email=email).exists():
        return 2
    return 0

import re

def is_valid_registration_data(username, password, email, first_name, last_name):
    if not all([username, password, email, first_name, last_name]):
        return False

    if not re.match(r'^\w+$', username):
        return False

    if len(password) < 8:
        return False

    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return False

    return True
