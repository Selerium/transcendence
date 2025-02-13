from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	# path("request", views.request_2fa_code, name="request-2fa-code"),
	path("", views.verify_2fa, name="verify-2fa-code"),
	path("check", views.checkIfUserNeeds2fa, name="check-verified")
]

# users: GET all's info, POST to create one's info
# users/{id}: GET one's info, PUT to update one's info, DELETE to remove one
