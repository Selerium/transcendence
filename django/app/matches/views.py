from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.conf import settings
from django.db.models import Q
from achievements.models import Achievement
from achievements.models import AchievementUnlocked
from achievements.serializers import AchievementUnlockedSerializer

import jwt
import requests

from .serializers import MatchSerializer
from .models import Match
from users.models import User
from users.serializers import UserSerializer
from friends.models import Friend

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET

@api_view(['GET', 'POST', 'PUT'])
def match(request):
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

    if request.method == 'GET':
        matches = Match.objects.all()

        match_data = []
        this_user = int(request.query_params.get('id'))

        for match in matches:
            if (match.player_one.id == this_user or (match.player_two and match.player_two.id == this_user)):
                match_data.append({
                    'match_id': match.match_id,
                    'player_one': {
                        'id': match.player_one.id,
                        'username': match.player_one.username,
                        'alias': match.player_one.alias,
                        'profile_pic': match.player_one.profile_pic
                    },
                    'player_two': {
                        'id': match.player_two.id if match.player_two else None,
                        'username': match.player_two.username if match.player_two else "AI",
                        'alias': match.player_two.alias if match.player_two else "AI",
                        'profile_pic': match.player_two.profile_pic if match.player_two else None
                    },
                    'is_ai_opponent': match.is_ai_opponent,
                    'start_time': match.start_time,
                    'end_time': match.end_time,
                    'player_one_score': match.player_one_score,
                    'player_two_score': match.player_two_score
                })
        return Response(data={'success': True, 'data': match_data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        player_one_id = request.data.get("player_one")
        player_two_id = request.data.get("player_two")
        player_one_score = request.data.get("player_one_score")
        player_two_score = request.data.get("player_two_score")
        is_ai_opponent = request.data.get("is_ai_opponent", False)

        player_one = get_object_or_404(User, username=player_one_id)
        player_two = None if is_ai_opponent else get_object_or_404(User, username=player_two_id)

        # if (player_two == None and player_two_score and player_one_score and player_two_score > player_one_score):
        #     try:
        #         unlocked = Achievement.objects.get(name='IM GONNA LOSE MY JOB TO AI')

        #         achieved, created = AchievementUnlocked.objects.create(user=player_one, unlocked=unlocked)
        #         if created:
        #             serializer = AchievementUnlockedSerializer(achieved)
        #             return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        #     except:
        #         return ERROR404
        
        # # do I need one for player_two score is 0, incase its player_two that loses (otherwise this achievement will only be unlocked if youre player one)
        # if (player_one_score == 0):
        #     try:
        #         unlocked = Achievement.objects.get(name='YOU GET A DONUT (unless they run out)')
        #         achieved, created = AchievementUnlocked.objects.get_or_create(user=player_one, unlocked=unlocked)

        #         if created:
        #             serializer = AchievementUnlockedSerializer(achieved)
        #             return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        #     except:
        #         return ERROR404

        # if (Match.objects.filter(player_one=player_one).count() == 0 and player_one_score and player_two_score and player_one_score > player_two_score):
        #     try:
        #         unlocked = Achievement.objects.get(name="BEGINNER'S LUCK")

        #         achieved, created = AchievementUnlocked.objects.create(user=player_one, unlocked=unlocked)
        #         if created:
        #             serializer = AchievementUnlockedSerializer(achieved)
        #             return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        #     except:
        #         return ERROR404


        # Create a new match
        match = Match.objects.create(
            player_one=player_one,
            player_two=player_two,
            player_one_score=player_one_score,
            player_two_score=player_two_score,
            is_ai_opponent=is_ai_opponent,
            start_time=now()
        )

        serializer = MatchSerializer(match)
        return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
   # to update match end
    elif (request.method == 'PUT'):
            data = request.data
            match = get_object_or_404(Match, match_id=data.get('match_id'))
            serializer = MatchSerializer(match, data={
                "player_one_score": data.get("player_one_score", match.player_one_score),
                "player_two_score": data.get("player_two_score", match.player_two_score),
                "end_time": now()
                }, partial=True)
            if serializer.is_valid():
                serializer.save()
                if (match.player_one_score < match.player_two_score and (match.player_two == None or match.player_two.id == None)):
                    try:
                        unlocked = Achievement.objects.get(name='IM GONNA LOSE MY JOB TO AI')

                        achieved, created = AchievementUnlocked.objects.get_or_create(user=match.player_one, unlocked=unlocked)
                        if created:
                            serializer = AchievementUnlockedSerializer(achieved)
                            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
                    except:
                        print('this achievement didnt work ' + unlocked.name)

                if (match.player_one and match.player_one_score == 0):
                    try:
                        unlocked = Achievement.objects.get(name='YOU GET A DONUT (unless they run out)')
                        achieved, created = AchievementUnlocked.objects.get_or_create(user=match.player_one, unlocked=unlocked)

                        if created:
                            serializer = AchievementUnlockedSerializer(achieved)
                            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
                    except:
                        print('this achievement didnt work ' + unlocked.name)

                if (match.player_two and match.player_two_score == 0):
                    try:
                        unlocked = Achievement.objects.get(name='YOU GET A DONUT (unless they run out)')
                        achieved, created = AchievementUnlocked.objects.get_or_create(user=match.player_two, unlocked=unlocked)

                        if created:
                            serializer = AchievementUnlockedSerializer(achieved)
                            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
                    except:
                        print('this achievement didnt work ' + unlocked.name)

                if (Match.objects.filter(player_one=match.player_one).count() == 0 and match.player_one_score and match.player_two_score and match.player_one_score > match.player_two_score):
                    try:
                        unlocked = Achievement.objects.get(name="BEGINNER'S LUCK")

                        achieved, created = AchievementUnlocked.objects.get_or_create(user=match.player_one, unlocked=unlocked)
                        if created:
                            serializer = AchievementUnlockedSerializer(achieved)
                            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
                    except:
                        print('this achievement didnt work ' + unlocked.name)

                if (Match.objects.filter(player_two=match.player_two).count() == 0 and match.player_two_score and match.player_two_score and match.player_two_score > match.player_one_score):
                    try:
                        unlocked = Achievement.objects.get(name="BEGINNER'S LUCK")

                        achieved, created = AchievementUnlocked.objects.get_or_create(user=match.player_two, unlocked=unlocked)
                        if created:
                            serializer = AchievementUnlockedSerializer(achieved)
                            return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
                    except:
                        print('this achievement didnt work ' + unlocked.name)

                return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
            return ERROR400  
    else:
            return ERROR404 

@api_view(['GET'])
def match_detail(request, match_id):
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
    if request.method == 'GET':
    # Retrieve le matches
        try:
            match = Match.objects.get(match_id=match_id)
        except Match.DoesNotExist:
            return Response(
            {'success': False, 'message': 'Match not found'},
            status=status.HTTP_404_NOT_FOUND
        )
        match_data = {
            'match_id': match.match_id,
            'player_one': {
                'id': match.player_one.id,
                'username': match.player_one.username,
                'profile_pic': match.player_one.profile_pic
            },
            'player_two': {
                'id': match.player_two.id if match.player_two else None,
                'username': match.player_two.username if match.player_two else "AI",
                'profile_pic': match.player_two.profile_pic if match.player_two else None
            },
            'is_ai_opponent': match.is_ai_opponent,
            'start_time': match.start_time,
            'end_time': match.end_time,
            'player_one_score': match.player_one_score,
            'player_two_score': match.player_two_score
        }
        return Response(data={'success': True, 'data': match_data}, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def rankings(request):
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

    matches = Match.objects.all()
    win_counts = {}

    for match in matches:
        if match.player_one_score >= 0 and match.player_two_score >= 0 and match.player_one_score > match.player_two_score:
            winner = match.player_one
        elif match.player_one_score >= 0 and match.player_two_score >= 0 and match.player_one_score < match.player_two_score:
            winner = match.player_two
        else:
            continue

        if winner:
            if winner.id in win_counts:
                win_counts[winner.id] += 1
            else:
                win_counts[winner.id] = 1

        print('hiiiiiii-------:')
        print(match.player_one_score)
        print(match.player_two_score)
        print(winner.id)

    ranked_users = []
    for user_id, wins in win_counts.items():
        user = User.objects.get(id=user_id, deleted=False)
        ranked_users.append({
            'user-id': user.pk,
            'user': user.username,
            'alias': user.alias,
            'wins': wins
        })

    ranked_users.sort(key=lambda x: x['wins'], reverse=True)
    return Response(data={'success': True, 'data': ranked_users}, status=status.HTTP_200_OK)

@api_view(['GET'])
def rankings_friends(request):
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

    matches = Match.objects.filter(
        Q(player_one_id__in=friend_ids) | Q(player_two_id__in=friend_ids)
    )

    win_counts = {}

    for match in matches:
        if match.player_one_score > match.player_two_score:
            winner = match.player_one
        elif match.player_one_score < match.player_two_score:
            winner = match.player_two
        else:
            continue

        if winner and winner.id in friend_ids:
            if winner.id in win_counts:
                win_counts[winner.id] += 1
            else:
                win_counts[winner.id] = 1

    ranked_friends = []
    for user_id, wins in win_counts.items():
        user = User.objects.get(id=user_id)
        ranked_friends.append({
            'user': user.username,
            'alias': user.alias,
            'wins': wins
        })

    ranked_friends.sort(key=lambda x: x['wins'], reverse=True)
    return Response(data={'success': True, 'data': ranked_friends}, status=status.HTTP_200_OK)