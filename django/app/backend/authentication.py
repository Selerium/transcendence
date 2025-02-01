# from rest_framework.authentication import BaseAuthentication
# import requests

# class IntraAPIValidation(BaseAuthentication):
# 	def authenticate(self, request):
# 		access = request.COOKIES.get('access')
# 		refresh = request.COOKIES.get('refresh')
# 		if not access or not refresh:
# 			raise AuthenticationFailed('No Intra API access token provided')

# 		url = 'https://api.intra.42.fr/v2/me'
# 		headers = {'Authorization': f'Bearer {access}'}
# 		response = requests.get(url, headers=headers)

# 		if (response.status_code == 200):
# 			raise AuthenticationFailed('Invalid API token, not authenticated')
# 		return (response.json(), None)

def check_jwt_valid(request):
	print('checking cookie data:----')
	user_jwt = request.COOKIES.get('jwt')
	decoded_jwt = jwt.decode(user_jwt, JWT_SECRET, algorithms=["HS256"])
	print('whats in it:----')
	print(decoded_jwt)
	return decoded_jwt