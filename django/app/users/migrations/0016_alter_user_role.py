# Generated by Django 5.1.5 on 2025-01-27 17:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.SmallIntegerField(choices=[(0, 'Student'), (2, 'Outcast'), (1, 'Admin')], default=0),
        ),
    ]
