from django.db import models
from users.models import User

# Create your models here.

class Message(models.Model):
    message_id = models.BigAutoField(primary_key=True)
    sender_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")
    content = models.CharField(max_length=500, null=False)

    def __str__(self):
        return f"Message sent from {self.sender_id} to {self.receiver_id}"
