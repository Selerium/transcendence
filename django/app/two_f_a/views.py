import random
from django.core.mail import send_mail
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.conf import settings
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from users.models import User

import jwt

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET

def generate_2fa_code():
    # random 6 digit code generator
    return ''.join(random.choices('0123456789', k=6))

def send_2fa_code(username):
    email = f"{username}@student.42abudhabi.ae"
    print(email)
    code = generate_2fa_code()
    subject = 'Your 2FA Code'
    message = f'Your 2FA code is: {code}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

    this_man = get_object_or_404(User, username=username)
    this_man.verifed = False

    cache.set(f'2fa_code_{email}', code, 300)
    return code

def verify_2fa_code(email, user_code):
    stored_code = cache.get(f'2fa_code_{email}')
    print('1')
    print(stored_code)
    print('2')
    print(user_code)
    cache.set(f'2fa_code_{email}', stored_code, 300)
    if stored_code and stored_code == user_code:
        cache.delete(f'2fa_code_{email}')
        return True
    return False

@api_view(['POST'])
def verify_2fa(request):
    try:
        user_jwt = request.COOKIES.get('jwt')
        decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
        this_user = decoded_jwt['data']['id']
    except:
            return ERROR400
    if request.method == 'POST':
        data = request.data
        print(data)
        email = data.get('email')
        print(email)
        code = data.get('code')
        print(code)
        if not email or not code:
            return ERROR400

        if verify_2fa_code(email, code):
            this_man = get_object_or_404(User, id=this_user)
            this_man.verifed = True
            return Response({'success': True, 'data': '2FA verification succesfully'}, status=status.HTTP_200_OK)
        else:
            return ERROR400
        print('in here 3')
    return ERROR404

@api_view(['GET'])
def checkIfUserNeeds2fa(request):
    # # uncomment this below line if you want to run without 2fa (just ignore the verify screen)
    return Response({'success': True, 'data': True}, status=status.HTTP_200_OK)
    try:
        user_jwt = request.COOKIES.get('jwt')
        decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
        this_user = decoded_jwt['data']['id']
    except:
        return ERROR400

    this_man = get_object_or_404(User, id=this_user)
    print('hiiii')
    print(this_man)
    print(this_man.verified)
    print('hiiii')
    return Response({'success': True, 'data': this_man.verified}, status=status.HTTP_200_OK)