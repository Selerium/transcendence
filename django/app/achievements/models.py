from django.db import models
from users.models import User

# Create your models here.
class Achievement(models.Model):
    # achievement_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255)
    icon = models.URLField()

    def __str__(self):
        return f"Achievement name: {self.name}"

class AchievementUnlocked(models.Model):
    # achievements_ul_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unlocked = models.ForeignKey(Achievement, on_delete=models.CASCADE);

    def __str__(self):
        return f"Achievement unlocked: {self.unlocked} by {self.user}"