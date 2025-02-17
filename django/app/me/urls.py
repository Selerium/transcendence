from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	path("", views.me, name="all-users-info"),
	path("update-status", views.update_status, name="reset-all-users-status"),
]

# users: GET all's info, POST to create one's info
# users/{id}: GET one's info, PUT to update one's info, DELETE to remove one
