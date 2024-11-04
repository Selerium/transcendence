import datetime
from django.shortcuts import render

# Create your views here.
def index(request):
	now = datetime.datetime.now()
	return render(request, "newyears/index.html",{
		"newyears": now.month = 1 and now.day = 1
	})
