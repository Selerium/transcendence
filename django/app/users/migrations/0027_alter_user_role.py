# Generated by Django 5.1.5 on 2025-02-04 15:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0026_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.SmallIntegerField(choices=[(1, 'Admin'), (0, 'Student'), (2, 'Outcast')], default=0),
        ),
    ]
