from django.db import models
from users.models import User

# Create your models here.

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    content = models.CharField(max_length=500, null=False)

    def __str__(self):
        return f"Message sent from {self.sender} to {self.receiver}"