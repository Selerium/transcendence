from django.db import models
from users.models import User

# Create your models here.

class Message(models.Model):
    sender = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="sent_messages", default=0)
    receiver = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="received_messages", default=0)
    content = models.CharField(max_length=500, null=False, default='')

    def __str__(self):
        return f"Message sent from {self.sender} to {self.receiver}"