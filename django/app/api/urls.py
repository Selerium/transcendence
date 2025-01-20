from django.urls import path
from . import views

urlpatterns = [
	path("users/", views.users, name="all-users-info"),
	path("users/<int:id>", views.users, name="user-id-info"),
]

# users: GET all's info, POST to create one's info
# users/{id}: GET one's info, PUT to update one's info, DELETE to remove one
