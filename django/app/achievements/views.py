from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from .serializers import AchievementSerializer
from users.models import User
from .models import Achievement, AchievementUnlocked
import jwt
import requests

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET

@api_view(['GET'])
def achievements(request, id=None):
    # get all achievements a specific user has unlocked
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

    if (request.method == 'GET'):
        try:
            unlocked = ''
            if (id == None):
                unlocked = AchievementUnlocked.objects.filter(user=this_user)
            else:
                unlocked = AchievementUnlocked.objects.filter(user=id)

            response_data = []
            for a in unlocked:
                response_data.append({
                    'name': a.unlocked.name,
                    'description': a.unlocked.description,
                    'icon': a.unlocked.icon
                })

            return Response(data={'success': True, 'data': response_data}, status=status.HTTP_200_OK)
        except:
            return Response(data={'success': False, 'data': 'No achievements unlocked yet'}, status=status.HTTP_200_OK)
    else:
        return ERROR404