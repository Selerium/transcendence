from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from .serializers import MessageSerializer
from django.shortcuts import get_object_or_404
from .models import Message
from users.models import User
import requests
import jwt
from django.conf import settings
from rest_framework.response import Response
from django.db.models import Q

## GET = retrieve messages (retrieve messages sent or received?)
## this would be in use when you want to pull the messages

## POST = create a new message 
## this would be useful for "sending messages" into the database

## 

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET

@api_view(['GET', 'POST'])
def messages(request):
    """
    Handles retrieving and sending messages.
    """

    try:
        user_jwt = request.COOKIES.get('jwt')
        decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
        url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {decoded_jwt['access']}'}
        response = requests.get(url, headers=headers)
        this_user = decoded_jwt['data']['id']
        if response.status_code != 200:
            return ERROR403
    except:
            return ERROR400
    
    if request.method == 'GET':
        try:
            data = request.query_params
            friend2_id = data.get('friend_id')
        except:
            ERROR400

        print(friend2_id)
        friend1 = User.objects.get(id=this_user)
        friend2 = get_object_or_404(User, id=friend2_id)

        msgs = Message.objects.filter(
            Q(sender=friend1, receiver=friend2) | Q(sender=friend2, receiver=friend1))
        
        serializer = MessageSerializer(msgs, many=True)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data
        try:
            receiverId = data.get('receiver')
            content = data.get('content')
        except:
            ERROR400

        print(data)
        print("------")
        print(receiverId)
        print("------")
        print(content)

        sender = User.objects.get(id=this_user)
        receiver = get_object_or_404(User, id=receiverId)
        newMsg = Message(sender=sender, receiver=receiver, content=content)

        try:
            newMsg.save()
            serializer = MessageSerializer(newMsg)
            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except:
            return ERROR400


