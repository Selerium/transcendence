from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	path("", views.intra_auth, name="intra-log-in"),
	path("code", views.intra_callback, name="intra-callback"),
]

