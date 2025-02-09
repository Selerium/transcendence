from rest_framework import serializers
from .models import Achievement, AchievementUnlocked

class AchievementSerializer(serializers.ModelSerializer):
	class Meta:
		model = Achievement
		fields = '__all__'

class AchievementUnlockedSerializer(serializers.ModelSerializer):
	class Meta:
		model = AchievementUnlocked
		fields = '__all__'