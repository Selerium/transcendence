# Generated by Django 5.1.5 on 2025-02-01 05:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.SmallIntegerField(choices=[(0, 'Student'), (1, 'Admin'), (2, 'Outcast')], default=0),
        ),
    ]
