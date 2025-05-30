from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db.models import Q
from django.core.files.storage import default_storage

from .serializers import UserSerializer
from .models import User
from friends.models import Friend
import jwt
import requests
import time

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET
TEAM_MEMBERS = {'jebucoy', 'jadithya', 'juhaamid', 'cmrabet', 'cafriem'}

@api_view(['PUT'])
def updateAlias(request):
    if request.method == 'PUT':
        try:
            user_jwt = request.COOKIES.get('jwt')
            decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
            url = 'https://api.intra.42.fr/v2/me'
            headers = {'Authorization': f'Bearer {decoded_jwt['access']}'}
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                return ERROR403
            this_user = decoded_jwt['data']['id']
        except:
            return ERROR400

        data = request.data
        alias = data.get('alias')

        if alias == None:
            return ERROR400

        user = get_object_or_404(User, id=this_user, deleted=False)
        user.alias = alias
        user.save()
        serializer = UserSerializer(user)
        return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
    return ERROR404

@api_view(['PUT'])
def updateProfilePic(request):
    if request.method == 'PUT':
        try:
            user_jwt = request.COOKIES.get('jwt')
            decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
            url = 'https://api.intra.42.fr/v2/me'
            headers = {'Authorization': f'Bearer {decoded_jwt['access']}'}
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                return ERROR403
            this_user = decoded_jwt['data']['id']
        except:
            return ERROR400
        
        user_id = this_user
        user = get_object_or_404(User, id=this_user)

        try:
            profile_pic = request.FILES['profile_pic']
            print('uploaded-----------------')

            file_path = default_storage.save(f'profile_pics/{profile_pic.name}', profile_pic)

            profile_pic_url = f"{settings.MEDIA_URL}{file_path}"

            print(profile_pic_url)

            user.profile_pic = profile_pic_url
            user.save()
            serializer = UserSerializer(user)
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except:
            return ERROR400

    return ERROR404

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def users(request, id=None):
    try:
        user_jwt = request.COOKIES.get('jwt')
        decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
        url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {decoded_jwt['access']}'}
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return ERROR403
        # this_user = decoded_jwt['data']['id']
    except:
        return ERROR400

    time.sleep(0.5)

    get_object_or_404(User, id=decoded_jwt['data']['id'])
    print('in the users api request:----')
    if (request.method == 'GET'):
        # GET all users' info
        if (id is None):
            users = User.objects.filter(deleted=False)
            serializer = UserSerializer(users, many=True)
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        # GET one user's info
        else:
            user = get_object_or_404(User, id=id, deleted=False)
            serializer = UserSerializer(user)
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        

    # POST and create a new user
    elif (request.method == 'POST' and id is None):
        print('creating a new user:----')
        data = request.data
        newUser = User(
            username=data.get('username'),
            profile_pic=data.get('profile_pic'),
        )
        print('test 0:----')
        print(data.get('username'))
        print(data.get('profile_pic'))
       

        try:
            print('test 1:----')
            newUser.full_clean()
            print('test 2:----')
            newUser.save()
            print('saved a user:----')
            serializer = UserSerializer(newUser)
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except:
            return ERROR400



    # PUT an update for one user
    elif (request.method == 'PUT' and not id == None):
        user = get_object_or_404(User, id=id, deleted=False)
        serializer = UserSerializer(user, data=request.data)
        if (serializer.is_valid()):
            serializer.save()
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        return ERROR400

    # DELETE a specific user
    elif (request.method == 'DELETE' and not id == None):
        user = get_object_or_404(User, id=id)
        user.deleted = True
        user.username = '--redacted--'
        user.profile_pic = ''
        user.status = 0
        user.save()
        serializer = UserSerializer(user)
        return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)

    return ERROR404

@api_view(['GET'])
def users_new(request):
    try:
        user_jwt = request.COOKIES.get('jwt')
        decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
        url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {decoded_jwt['access']}'}
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return ERROR403
        this_user = decoded_jwt['data']['id']
    except:
        return ERROR400

    time.sleep(0.5)

    friends = Friend.objects.filter(
        (Q(friend1=this_user) | Q(friend2=this_user)) & Q(friend_status='1')
    )
    friend_ids = set()
    for friend in friends:
        if friend.friend1.id != this_user:
            friend_ids.add(friend.friend1.id)
        if friend.friend2.id != this_user:
            friend_ids.add(friend.friend2.id)

    friend_ids.add(this_user)
    friend_ids.add(1)

    non_friends = User.objects.exclude(id__in=friend_ids)
    return_data = UserSerializer(non_friends, many=True)

    return Response(data={'success': True, 'data': return_data.data}, status=status.HTTP_200_OK)