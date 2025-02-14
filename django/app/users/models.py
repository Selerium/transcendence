from django.db import models

# Create your models here.
class User(models.Model):
    STATUS_CHOICE = (
        (0, 'Offline'),
        (1, 'Online'),
        (2, 'In Game'),
    )

    ROLE_CHOICES = (
        (0, 'Student'),
        (1, 'Admin'),
        (2, 'Outcast'),
    )

    username = models.CharField(max_length=20, unique=True)
    alias = models.CharField(max_length=20, default=None, null=True)
    profile_pic = models.URLField(blank=True, null=True)
    status = models.SmallIntegerField(choices=STATUS_CHOICE, default=1)
    deleted = models.BooleanField(null=False, default=False)
    role = models.SmallIntegerField(choices=ROLE_CHOICES, default=0)
    verified = models.BooleanField(null=False, default=False)

    def __str__(self):
        return self.username