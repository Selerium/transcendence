from django.urls import path
from . import views
from .views import redirect_to_intra_auth, intra_callback

app_name='main_app'

urlpatterns = [
	path('', views.home, name='home'),
	path('home/', views.home, name='main'),
	path('login/',views.login, name='login'),
    path('redirect_intra/', redirect_to_intra_auth,name='redirect_intra'),
	path('intra_callback/', intra_callback,name='intra_callback'),
	# path("main", views.main, name="main")
]