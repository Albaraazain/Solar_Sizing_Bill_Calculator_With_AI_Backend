# Generated by Django 5.0.7 on 2024-07-29 09:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('solar', '0002_potentialcustomers_inverter_availability_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='potentialcustomers',
            name='address',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
    ]
