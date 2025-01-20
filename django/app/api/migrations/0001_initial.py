# Generated by Django 5.1.5 on 2025-01-18 17:17

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=20)),
                ('email', models.EmailField(max_length=254, null=True, unique=True)),
                ('password', models.CharField()),
                ('account_type', models.BooleanField()),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
