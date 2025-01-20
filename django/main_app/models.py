from django.db import models
from django.contrib.auth.models import AbstractUser

# class User(AbstractUser):
#     STATUS_CHOICE = [
#         (0, 'Offline'),
#         (1, 'Online'),
#         (2, 'In Game'),
#     ]
#     user_id = models.AutoField(primary_key=True, )  # Primary Key
#     username = models.CharField(max_length=255, unique=True)  # Unique Username
#     first_name = models.CharField(max_length=255)
#     last_name = models.CharField(max_length=255)
#     email = models.CharField(max_length=255, unique=True, null=False, default="")
#     profile_pic = models.URLField(blank=True, null=True, default="")  # Default profile picture URL
#     matches_won = models.PositiveIntegerField(default=0)  # Match wins, default to 0
#     tournaments_won = models.PositiveIntegerField(default=0)  # Tournament wins, default to 0
#     status = models.SmallIntegerField(choices=STATUS_CHOICE,default=0)

#     def __str__(self):
#         return self.username

class User(AbstractUser):
    STATUS_CHOICE = [
        (0, 'Offline'),
        (1, 'Online'),
        (2, 'In Game'),
    ]
    profile_pic = models.URLField(blank=True, null=True, default="")
    matches_won = models.PositiveIntegerField(default=0)
    tournaments_won = models.PositiveIntegerField(default=0)
    status = models.SmallIntegerField(choices=STATUS_CHOICE, default=0)


    def __str__(self):
        return self.username

class Match(models.Model):
    match_id = models.AutoField(primary_key=True)  # Primary Key
    player_one = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name='matches_player_one')
    player_two = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name='matches_player_two')
    player_one_score = models.BigIntegerField(default=0)
    player_two_score = models.BigIntegerField(default=0)
    start_time = models.DateTimeField()  # Start time of the match
    end_time = models.DateTimeField()  # End time of the match

    def __str__(self):
        return f"Match {self.match_id}: {self.player_one.username} vs {self.player_two.username}"

class TourMatch(models.Model):
    tour_match_id = models.AutoField(primary_key=True)
    match_id = models.ForeignKey('Match', on_delete=models.CASCADE)
    round_id = models.ForeignKey('TourRound', on_delete=models.CASCADE)
    
    def __str__(self):
        return "Tour Match"

class TourRound(models.Model):
    round_id = models.AutoField(primary_key=True)
    tour_id = models.ForeignKey('Tournament', on_delete=models.CASCADE)
    round_num = models.BigIntegerField(default=1, null=False)
    
    def __str__(self):
        return f"Round number {self.round_num} for Tour #{self.tour.id}"
    


class Tournament(models.Model):
    tour_id = models.AutoField(primary_key=True)
    tour_name = models.CharField(max_length=50, null=False)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"{self.tour_id} Tournament Name {self.tour_name}"
    



class Friend(models.Model):
    STATUS_CHOICES = [
        (0, 'Inactive'),  # Friendship is declined or removed
        (1, 'Active'),  # Friendship is active
        (2, 'Pending'),  # Friendship request is pending
    ]

    user = models.ForeignKey(User, related_name='user_friends', on_delete=models.CASCADE)  # Ref to users.user_id
    friend = models.ForeignKey(User, related_name='friends_of', on_delete=models.CASCADE)  # Ref to users.user_id
    friend_status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=0
    )  # Friendship status with choices

    class Meta:
        unique_together = ('user', 'friend')  # Composite Primary Key equivalent
        indexes = [
            models.Index(fields=['user', 'friend']),  # Index for user and friend
        ]

    def __str__(self):
        return f"{self.user.username} - {self.friend.username} ({self.get_friend_status_display()})"

class Achievement(models.Model):
    achievement_id = models.AutoField(primary_key=True)
    achievement_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"Achievement #{self.achievement_id} : {self.achievement_name}"

class AchievementUnlocked(models.Model):
    achievements_ul_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey('User', on_delete=models.CASCADE)
    achievement_unlocked = models.ForeignKey('Achievement', on_delete=models.CASCADE);

    def __str__(self):
        return f"Achievement unlocked: {self.achievement_unlocked} by {self.user_id}"
    
    