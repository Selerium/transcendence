from django.urls import path
from . import views

app_name='main_app'

urlpatterns = [
	path('', views.home, name='home'),
	path('home/', views.home, name='main'),
	path('login/',views.login, name='login'),
	# path("main", views.main, name="main")
]