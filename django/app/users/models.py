from django.db import models

# Create your models here.
class User(models.Model):
    STATUS_CHOICE = (
        (0, 'Offline'),
        (1, 'Online'),
        (2, 'In Game'),
    )

    ROLE_CHOICES = {
        (0, 'Student'),
        (1, 'Admin'),
        (2, 'Outcast'),
    }

    username = models.CharField(max_length=20, unique=True)
    profile_pic = models.URLField(blank=True, null=True)
    status = models.SmallIntegerField(choices=STATUS_CHOICE, default=0)
    deleted = models.BooleanField(null=False, default=False)
    role = models.SmallIntegerField(choices=ROLE_CHOICES, default=0)
    verified = models.BooleanField(null=False, default=False)

    def __str__(self):
        return self.username

# class Match(models.Model):
#     match_id = models.AutoField(primary_key=True)  # Primary Key
#     player_one = models.ForeignKey('GameUser', on_delete=models.SET_NULL, null=True, related_name='matches_player_one')
#     player_two = models.ForeignKey('GameUser', on_delete=models.SET_NULL, null=True, related_name='matches_player_two')
#     player_one_score = models.BigIntegerField(default=0)
#     player_two_score = models.BigIntegerField(default=0)
#     start_time = models.DateTimeField()  # Start time of the match
#     end_time = models.DateTimeField()  # End time of the match

#     def __str__(self):
#         return f"Match {self.match_id}: {self.player_one.username} vs {self.player_two.username}"

# class TourMatch(models.Model):
#     tour_match_id = models.AutoField(primary_key=True)
#     match_id = models.ForeignKey('Match', on_delete=models.CASCADE)
#     round_id = models.ForeignKey('TourRound', on_delete=models.CASCADE)
    
#     def __str__(self):
#         return "Tour Match"

# class TourRound(models.Model):
#     round_id = models.AutoField(primary_key=True)
#     tour_id = models.ForeignKey('Tournament', on_delete=models.CASCADE)
#     round_num = models.BigIntegerField(default=1, null=False)
    
#     def __str__(self):
#         return f"Round number {self.round_num} for Tour #{self.tour.id}"

# class Tournament(models.Model):
#     tour_id = models.AutoField(primary_key=True)
#     tour_name = models.CharField(max_length=50, null=False)
#     start_time = models.DateTimeField()
#     end_time = models.DateTimeField()

#     def __str__(self):
#         return f"{self.tour_id} Tournament Name {self.tour_name}"
