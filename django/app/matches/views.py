from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from .serializers import MatchSerializer
from .models import Match
from users.models import User
ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET', 'POST', 'PUT'])
def match(request):

    if request.method == 'GET':
    # Retrieve le matches
        matches = Match.objects.all()
        
        match_data = []
        for match in matches:
            match_data.append({
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
            })
        return Response(data={'success': True, 'data': match_data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        player_one_id = request.data.get("player_one")
        player_two_id = request.data.get("player_two")
        is_ai_opponent = request.data.get("is_ai_opponent", False)

        player_one = get_object_or_404(User, id=player_one_id)
        player_two = None if is_ai_opponent else get_object_or_404(User, id=player_two_id)


        # Create a new match
        match = Match.objects.create(
            player_one=player_one,
            player_two=player_two,
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
                return Response(data={'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
            return ERROR400  
    else:
            return ERROR404 

@api_view(['GET'])
def match_detail(request, match_id):
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
    

