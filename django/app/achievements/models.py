from django.db import models

# Create your models here.
class Achievement(models.Model):
    achievement_id = models.AutoField(primary_key=True)
    achievement_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"Achievement #{self.achievement_id} : {self.achievement_name}"

class AchievementUnlocked(models.Model):
    achievements_ul_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey('GameUser', on_delete=models.CASCADE)
    achievement_unlocked = models.ForeignKey('Achievement', on_delete=models.CASCADE);

    def __str__(self):
        return f"Achievement unlocked: {self.achievement_unlocked} by {self.user_id}"