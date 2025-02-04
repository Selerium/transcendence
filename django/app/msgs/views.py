from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from .serializers import MessageSerializer
from django.shortcuts import get_object_or_404
from .models import Message
from users.models import User
import requests
from rest_framework.response import Response

## GET = retrieve messages (retrieve messages sent or received?)
## this would be in use when you want to pull the messages
## POST = create a new message 
## this would be useful for sending messages 
## sender ID would always be "me"
## should I pull sender messages or receiver messages?
## should I only pull messages between two people?

## 

@api_view(['GET', 'POST'])
def messages(request):
    """
    Handles retrieving and sending messages.
    """
    if request.method == 'GET':
        # Fetch messages for a user (or between two users)
        receiver_id = request.GET.get('receiver_id')
        sender_id = request.GET.get('sender_id')

        if not receiver_id:
            return Response({'success': False, 'message': 'receiver_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if sender_id:
            messages = Message.objects.filter(sender_id=sender_id, receiver_id=receiver_id)
        else:
            messages = Message.objects.filter(receiver_id=receiver_id)

        serializer = MessageSerializer(messages, many=True)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Send a new message
        data = request.data
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content')

        if not sender_id or not receiver_id or not content:
            return Response({'success': False, 'message': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch User instances
        sender = get_object_or_404(User, id=sender_id)
        receiver = get_object_or_404(User, id=receiver_id)

        # Create Message instance
        message = Message.objects.create(sender=sender, receiver=receiver, content=content)
        serializer = MessageSerializer(message)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)

    return Response({'success': False, 'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

