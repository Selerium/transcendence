from django.urls import path
from . import views

# paths that are appended on to the url that matched earlier
	# example: "/api/users/" is appended with "" and "{id}" below
urlpatterns = [
	path('', views.match, name='matches'),
		path("<int:match_id>", views.match_detail, name="match_detail"),
	# path('\tournament', views.tournament, name=)

]
