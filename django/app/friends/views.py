from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.conf import settings
from .serializers import FriendSerializer
from .models import Friend
from users.models import User
from achievements.models import Achievement, AchievementUnlocked
from achievements.serializers import AchievementUnlockedSerializer

import jwt
import requests
import time

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET

@api_view(['GET', 'POST', 'PUT'])
def friends(request, id=None):
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

	get_object_or_404(User, id=decoded_jwt['data']['id'])
	# return all friendships
	if (id == None and request.method == 'GET'):
		user_friends = Friend.objects.filter(Q(friend1=this_user) | Q(friend2=this_user)).exclude(friend_status='0').select_related('friend1', 'friend2')

		response_data = []
		
		response_data.append({
			'id': '1',
			'username': 'SYSTEM',
			'alias': 'm a r v',
			'profile_pic': 'styles/images/tournament.png',
			'friend_status': '1',
			'request_id': '0',
			'blockedBy': '0'
		})

		for request in user_friends:
			other_user = request.friend1 if request.friend2.id == this_user else request.friend2

			response_data.append({
				'id': other_user.id,
				'username': other_user.username,
				'alias': other_user.alias,
				'profile_pic': other_user.profile_pic,
				'friend_status': request.friend_status,
				'request_id': request.id,
				'blockedBy': ((request.blockedBy == '2' and other_user == request.friend1) or (request.blockedBy == '1' and other_user == request.friend2) or (request.blockedBy == '0')) or (request.friend_status == '1')
			})

		return Response(data={'success': True, 'data': response_data}, status=status.HTTP_200_OK)
	# create a new 'friendship'
	elif (id == None and request.method == 'POST'):
		data = request.data
		newFriend = Friend(
			friend1=User.objects.get(id=this_user),
			friend2=User.objects.get(id=data.get('friend')),
			sentBy=this_user
		)

		try:
			checkFriend = Friend.objects.get(friend1=newFriend.friend1, friend2=newFriend.friend2)
			if (checkFriend):
				checkFriend.friend_status = '0'
				checkFriend.save()
				serializer = FriendSerializer(checkFriend)
				return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
		except:
			print('no friend okay new friend')
		print('help--------')
		print(User.objects.get(id=this_user))
		print(User.objects.get(id=data.get('friend')))
		print('--------help')
		try:
			print('1------')
			print(newFriend.friend_status)
			newFriend.full_clean()
			print('2------')
			newFriend.save()
			print('3------')
			serializer = FriendSerializer(newFriend)
			print('4------')
			return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
		except Exception as e:
			print(e)
			return ERROR400
	# update a friendship
	elif (id != None and request.method == 'PUT'):
		data = request.data
		friend = Friend.objects.get(id=id)
		blocking_user = User.objects.get(id=this_user)

		if friend.friend_status == '3':
			if request.data.get('blockedBy') == '0' and friend.blockedBy == '1' and blocking_user != friend.friend1:
				return ERROR403
			elif request.data.get('blockedBy') == '0' and friend.blockedBy == '2' and blocking_user != friend.friend2:
				return ERROR403
			elif request.data.get('blockedBy') == '1' and friend.blockedBy != '0':
				return ERROR403

		if friend.friend1 == blocking_user:
			final_block_user = '1'
		elif friend.friend2 == blocking_user:
			final_block_user = '2'
		if request.data.get('blockedBy') == '0':
			final_block_user = '0'
		try:
			friend.friend_status = data['friend_status']
			friend.blockedBy = final_block_user
			friend.full_clean()
			friend.save()
			serializer = FriendSerializer(friend)
			return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
		except:
			return ERROR400
	else:
		return ERROR404

@api_view(['GET'])
def friendRequests(request):
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

	# return all friendships
	if request.method == 'GET':
		pending_requests = Friend.objects.filter(
			Q(friend1=this_user) | Q(friend2=this_user),
			friend_status='0',
		).exclude(
			sentBy=this_user
		).select_related('friend1', 'friend2')

		response_data = []
		for request in pending_requests:
			other_user = request.friend1 if request.friend2.id == this_user else request.friend2

			response_data.append({
				'id': request.id,
				'sentBy': request.sentBy,
				'other_user': {
					'id': other_user.id,
					'username': other_user.username,
					'alias': other_user.alias,
					'profile_pic': other_user.profile_pic,
					'status': other_user.status,
					'role': other_user.role,
				},
				'friend_status': request.friend_status,
			})

		return Response(data={'success': True, 'data': response_data}, status=status.HTTP_200_OK)

	else:
		return ERROR404

@api_view(['DELETE'])
def deleteFriend(request, id=None):
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

	# delete friendship / decline request
	if (id != None and request.method == 'DELETE'):
		data = request.data
		friend = get_object_or_404(Friend, friend1=data.get('friend1'), friend2=data.get('friend2'))
		friend.friend_status = 2
		friend.save()
		serializer = FriendSerializer(friend)
		return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
	return ERROR404