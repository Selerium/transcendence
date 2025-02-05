from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	path("", views.friends, name="friends-info"),
	path("<int:id>", views.friends, name="friend-update"),
	path("<int:id>/delete", views.deleteFriend, name="friend-delete"),
	path("requests", views.friendRequests, name="friend-requests-info"),
]

# '/api/friends/' - GET your friends info
# '/api/friends/' - POST a new friend request
# '/api/friends/' - PUT to accept a friend request
# '/api/friends/{id}' - DELETE a sent friend request or cancel a received request or remove a friend
