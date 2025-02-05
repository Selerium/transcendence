from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	path('', views.match, name='matches'),
	path('\tournament', views.tournament, name=)

]
