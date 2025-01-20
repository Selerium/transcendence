from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .serializers import UserSerializer
from django.http import Http404

from .models import User

@api_view(['GET', 'POST'])
def users(request, id=None):
    if (request.method == 'GET' and id == None):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif (request.method == 'GET'):
        try:
            serializer = UserSerializer(User.objects.get(id=id))
        except:
            return Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif (request.method == 'POST' and id == None):
        data = request.data
        newUser = User(
            username=data.get('username'),
            profile_pic=data.get('profile_pic'),
            status=data.get('status'),
        )
        try:
            newUser.full_clean()
            newUser.save()
            return Response(data={'success': True, 'message': 'Succesfully added user'}, status=status.HTTP_200_OK)
        except:
            return Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)

    elif (request.method == 'PUT' and not id == None):
        try:
            serializer = UserSerializer(User.objects.get(id=id), data=request.data)
        except:
            return Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
        if (serializer.is_valid()):
            serializer.save();
            return Response(data={'success': True, 'message': 'Updated user'}, status=status.HTTP_200_OK)
