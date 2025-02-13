"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import oauth

# give path to find specific API view
    # example: path('api/app-name/', include("app-name.urls")),
	# remember we are ONLY USING FUNCTION-BASED VIEWS, NOT CLASS-BASED
urlpatterns = [
    path('api/users/', include("users.urls")),
    path('api/friends/', include("friends.urls")),
    path('api/oauth/', include("oauth.urls")),
    path('api/me/', include("me.urls")),
    path('api/msgs/', include("msgs.urls")),
    path('api/matches/', include("matches.urls")),
    path('api/achievements/', include("achievements.urls")),
    path('api/verify/', include("two_f_a.urls")),
    path('api/intra_callback/', oauth.views.intra_callback),
    path('admin/', admin.site.urls),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


