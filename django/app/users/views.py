from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404

from .serializers import UserSerializer

from .models import User

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def users(request, id=None):
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
        data = request.data
        newUser = User(
            username=data.get('username'),
            profile_pic=data.get('profile_pic'),
            status=data.get('status'),
        )
        try:
            newUser.full_clean()
            newUser.save()
            serializer = UserSerializer(newUser)
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except:
            return ERROR400

    # PUT an update for one user
    elif (request.method == 'PUT' and not id == None):
        user = get_object_or_404(User, id=id, deleted=False)
        serializer = UserSerializer(user, data=request.data)
        if (serializer.is_valid()):
            serializer.save();
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