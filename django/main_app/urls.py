from atexit import register

from django.urls import path
from . import views
from .views import redirect_to_intra_auth, intra_callback, register_view, register_user
from django.views.generic import TemplateView

app_name='main_app'

urlpatterns = [
	# path('home/', views.home, name='main'),
	path('login/',views.login, name='login'),
	path('login_user/', views.login, name='login'),
	path('redirect_intra/', redirect_to_intra_auth,name='redirect_intra'),
	path('intra_callback/', intra_callback,name='intra_callback'),
	path('register/', register_view,name='register_view'),
	path('register_user/', register_user,name='register_user'),
	path('', TemplateView.as_view(template_name='index.html'), name='index'),
	# path("main", views.main, name="main")
]