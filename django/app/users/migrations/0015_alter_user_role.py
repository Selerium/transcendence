# Generated by Django 5.1.5 on 2025-01-27 15:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.SmallIntegerField(choices=[(2, 'Outcast'), (1, 'Admin'), (0, 'Student')], default=0),
        ),
    ]
