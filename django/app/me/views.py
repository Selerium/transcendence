from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from users.models import User
from users.serializers import UserSerializer
import jwt
import requests
import time

ERROR400 = Response(data={'success': False, 'message': 'Invalid fields'}, status=status.HTTP_400_BAD_REQUEST)
ERROR404 = Response(data={'success': False, 'message': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
ERROR403 = Response(data={'success': False, 'message': 'Not Authenticated'}, status=status.HTTP_403_FORBIDDEN)

JWT_SECRET = settings.JWT_SECRET

@api_view(['GET'])
def me(request):
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

    time.sleep(0.5)

    me_data = get_object_or_404(User, username=decoded_jwt['data']['username'])
    me_data.status = 1
    me_data.save()
    info = UserSerializer(me_data)
    return Response(data={'success': True, 'data': info.data}, status=status.HTTP_200_OK)

@api_view(['GET'])
def update_status(request):
    cron_secret = request.headers.get("CRON-SECRET")
    print(cron_secret)

    if cron_secret != settings.CRON_SECRET_KEY:
        return ERROR403

    updated_count = User.objects.filter(status=1).exclude(id=1).update(status=0)
    return Response(data={'success': True, 'data': 'online status updated'}, status=status.HTTP_200_OK)