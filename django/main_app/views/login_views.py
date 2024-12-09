from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import redirect
from urllib.parse import urlencode
import requests


CLIENT_ID = 'u-s4t2ud-755c5acf204f051d241dde32f5d7ae8de7c695e8007e25098bd67c5b69780990'
CLIENT_SECRET = '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'
REDIRECT_URI = 'http://localhost:8000/intra_callback/'
AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
TOKEN_URL = 'https://api.intra.42.fr/oauth/token'

def login(request):
    return render(request, '../templates/pages/login.html')

# Create your views here.
def redirect_to_intra_auth(request):
    params = {
        'response_type': 'code',
        'client_id':CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'scope':'public'
    }
    print(params)
    auth_url=f"{AUTHORIZE_URL}?{urlencode(params)}"
    print(auth_url)
    return redirect(auth_url)

def get_user_info(access_token):
    url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:

        user_data = response.json()
        print(str(user_data))
        username = user_data.get('login')

        profile_image = user_data.get('image',{}).get('link')
        print(f"username: {username} profile_image: {profile_image}")
        return {'username': username,'profile_image' :profile_image}
    else:
        print('Error 01 Occurred in getting user info')
        return None

def intra_callback(request):
    code = request.GET.get('code')
    if not code:
        return HttpResponse("Error: No Code Provided", status=400)
    data = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'redirect_uri': REDIRECT_URI,
    }
    response = requests.post(TOKEN_URL, data=data)
    if response.status_code == 200:
        access_token = response.json()['access_token']
        user_info = get_user_info(access_token)
        if user_info:
            print(user_info)
            return HttpResponse(str(user_info))