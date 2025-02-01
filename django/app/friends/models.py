from django.db import models
from users.models import User

# Create your models here.
class Friend(models.Model):
    STATUS_CHOICES = [
        (0, 'Pending'),  # Friendship request is pending
        (1, 'Active'),  # Friendship is active
        (2, 'Inactive'),  # Friendship is active
    ]

    # friend_id 
    friend1 = models.ForeignKey(User, related_name='friend1', on_delete=models.CASCADE)  # Ref to users.user_id
    friend2 = models.ForeignKey(User, related_name='friend2', on_delete=models.CASCADE)  # Ref to users.user_id
    friend_status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=0
    )  # Friendship status with choices

    class Meta:
        unique_together = ('friend1', 'friend2')  # Composite Primary Key equivalent
        indexes = [
            models.Index(fields=['friend1', 'friend2']),  # Index for user and friend
        ]

    def save(self, *args, **kwargs):
        if self.friend1.id > self.friend2.id:
            self.friend1, self.friend2 = self.friend2, self.friend1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.friend1.username} - {self.friend2.username} ({self.get_friend_status_display()})"
