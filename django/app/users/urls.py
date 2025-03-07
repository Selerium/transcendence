from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	path("", views.users, name="all-users-info"),
	path("<int:id>", views.users, name="user-id-info"),
	path("new", views.users_new, name="user-id-info"),
	path("update/alias", views.updateAlias, name="user-update-alias"),
	path("update/profile", views.updateProfilePic, name="user-update-alias"),
]

# users: GET all's info, POST to create one's info
# users/{id}: GET one's info, PUT to update one's info, DELETE to remove one
