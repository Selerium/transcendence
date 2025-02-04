from django.contrib import admin
from msgs.models import Message
from users.models import User

admin.site.register(Message)
admin.site.register(User)