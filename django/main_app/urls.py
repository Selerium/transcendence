from django.urls import path
from .views import main_view

# app_name='pongpong'
urlpatterns = [
	path('home/', main_view.home, name="main"),
	# path("main", views.main, name="main")
]