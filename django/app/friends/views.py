from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404

from .serializers import FriendSerializer
from .models import Friend

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET', 'POST', 'PUT'])
def friends(request):
	try:
		user_jwt = request.COOKIES.get('jwt')
		decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
		url = 'https://api.intra.42.fr/v2/me'
		headers = {'Authorization': f'Bearer {decoded_jwt['access']}'}
		response = requests.get(url, headers=headers)
		if response.status_code != 200:
			return ERROR403
	except:
		return ERROR400
	# return all friendships
	if (request.method == 'GET'):
		serializer = FriendSerializer(Friend.objects.all(), many=True)
		return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
	# create a new 'friendship'
	elif (request.method == 'POST'):
		data = request.data
		newFriend = Friend(
			friend1=data.get('friend1'),
			friend2=data.get('friend2'),
			friend_status=0,
		)
		try:
			newFriend.full_clean()
			newFriend.save()
			serializer = FriendSerializer(newFriend)
			return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
		except:
			return ERROR400
	# update a friendship
	elif (request.method == 'PUT'):
		data = request.data
		friend = get_object_or_404(Friend, friend1=data.get('friend1'), friend2=data.get('friend2'))
		serializer = FriendSerializer(friend, request.data)
		if (serializer.is_valid()):
			serializer.save()
			return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
		return ERROR400
	else:
		return ERROR404

@api_view(['DELETE'])
def deleteFriend(request, id=None):
	# delete friendship / decline request
	if (id != None and request.method == 'DELETE'):
		data = request.data
		friend = get_object_or_404(Friend, friend1=data.get('friend1'), friend2=data.get('friend2'))
		friend.friend_status = 2
		friend.save()
		serializer = FriendSerializer(friend)
		return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
	return ERROR404