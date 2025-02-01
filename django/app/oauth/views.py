from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from urllib.parse import urlencode
from users.models import User
from users.views import users
from django.test import RequestFactory
from django.conf import settings

import requests
import jwt

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)

CLIENT_ID = 'u-s4t2ud-755c5acf204f051d241dde32f5d7ae8de7c695e8007e25098bd67c5b69780990'
CLIENT_SECRET = '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'
REDIRECT_URI = 'http://localhost:8000/intra_callback/'
AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
JWT_SECRET = settings.JWT_SECRET

def jwt_generator(info, access, refresh):
    obj = {
        "data": info,
        "access": access,
        "refresh": refresh
    }
    return jwt.encode(obj, JWT_SECRET, algorithm="HS256")
    # just using HMAC with SHA256 bc it's the most common JWT algorithm

def test_auth(access, refresh):
    url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access}'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return True
    return False

def intra_auth(request):
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'scope': 'public',
        'redirect_uri': REDIRECT_URI
    }

    auth_url=f"{AUTHORIZE_URL}?{urlencode(params)}"
    return redirect(auth_url)

def get_user_info(access_token, refresh_token):
    url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        user_data = response.json()
        username = user_data.get('login')
        profile_image = user_data.get('image',{}).get('link')
        print(f"username:<{username}> profile_image:<{profile_image}>")
        try:
            User.objects.get(username=username)
        except:
            print('registering the user:----')
            newUser = User(
                username=username,
                profile_pic=profile_image,
            )
            newUser.save()
            serializer = UserSerializer(newUser)
            print('registered')
        return {'username': username,'profile_pic': profile_image}
    print('Error 01 Occurred in getting user info')
    return None

@api_view(['GET'])
def intra_callback(request):
    code = request.GET.get('code')
    if not code:
        return ERROR400
    data = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'redirect_uri': REDIRECT_URI,
    }
    response = requests.post(TOKEN_URL, data=data)
    if response.status_code == 200:
        access_token = response.json()['access_token']
        refresh_token = response.json()['refresh_token']
        user_info = get_user_info(access_token, refresh_token)
        if user_info:
            # authenticate user as 'username' and give them JWT
            jwt_token = jwt_generator(user_info, access_token, refresh_token)
            response = redirect('http://localhost:8080/dashboard')
            response.set_cookie(
                key="jwt",
                value = jwt_token,
                httponly=True,
                secure=False, # change to True when we're in production, this is just temporary
                samesite="Lax",
                max_age=7200
            )
            return response
    # let them know they're not authenticated bc not found in intra API
    return redirect('http://localhost:8080/not-allowed')