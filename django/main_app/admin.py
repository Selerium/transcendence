from django.contrib import admin
from .models import (
    User, 
    Match, 
    TourMatch, 
    TourRound, 
    Tournament, 
    Friend, 
    Achievement, 
    AchievementUnlocked
)

# Register models
admin.site.register(User)
admin.site.register(Match)
admin.site.register(TourMatch)
admin.site.register(TourRound)
admin.site.register(Tournament)
admin.site.register(Friend)
admin.site.register(Achievement)
admin.site.register(AchievementUnlocked)
