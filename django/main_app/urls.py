from django.urls import path
from . import views
from .views import redirect_to_intra_auth, intra_callback
from django.views.generic import TemplateView

app_name='main_app'

urlpatterns = [
	# path('home/', views.home, name='main'),
	path('login/',views.login, name='login'),
    path('redirect_intra/', redirect_to_intra_auth,name='red irect_intra'),
	path('intra_callback/', intra_callback,name='intra_callback'),
	path('', TemplateView.as_view(template_name='index.html'), name='index'),
	# path("main", views.main, name="main")
]