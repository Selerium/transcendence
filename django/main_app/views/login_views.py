import json

from django.contrib.auth import authenticate, login as auth_login
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from urllib.parse import urlencode
from django.views.decorators.csrf import csrf_exempt
from main_app.utilities.registration import check_user_exists, is_valid_registration_data
import requests
from main_app.models import User

CLIENT_ID = 'u-s4t2ud-755c5acf204f051d241dde32f5d7ae8de7c695e8007e25098bd67c5b69780990'
CLIENT_SECRET = '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'
REDIRECT_URI = 'http://localhost:8000/intra_callback/'
AUTHORIZE_URL = 'https://api.intra.42.fr/oauth/authorize'
TOKEN_URL = 'https://api.intra.42.fr/oauth/token'

@csrf_exempt
def login(request):
    if request.method == 'GET':
        return render(request, '../templates/pages/login.html')
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return HttpResponse("Error: Username and password are required.", status=400)

            user = User.objects.filter(username=username).first()
            if user is not None:
                if user.check_password(password):
                    return JsonResponse({"message":"Success","chaimae":"https://www.google.ae"}, status=200)
                else:
                    return JsonResponse({"message":"Wrong User or Password","chaimae":"https://www.google.ae"}, status=200)
            else:
                return JsonResponse({"message":"Wrong User or Password","chaimae":"https://www.google.ae"}, status=200)
        except json.JSONDecodeError:
            return HttpResponse("Error: Invalid JSON data.", status=400)
        except Exception as e:
            return HttpResponse(f"Error: {str(e)}", status=500)
    else:
        return HttpResponse("Error: Invalid request method.", status=405)

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


def register_view(request):
    return render(request, '../templates/pages/register.html')
@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return HttpResponse("Error: Invalid Request Method", status=405)

    username = request.POST.get('username')
    password = request.POST.get('password')
    first_name = request.POST.get('first_name')
    last_name = request.POST.get('last_name')
    email = request.POST.get('email')

    if not is_valid_registration_data(username, password, email, first_name, last_name):
        return HttpResponse("Error: Invalid data provided", status=400)

    check_result = check_user_exists(username, email)
    if check_result == 1:
        return HttpResponse("Error: Username already taken", status=400)
    elif check_result == 2:
        return HttpResponse("Error: Email already registered", status=400)

    # Create and save the new user
    new_user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name
    )
    new_user.set_password(password)
    new_user.save()

    return HttpResponse("Success: User registered successfully", status=201)
