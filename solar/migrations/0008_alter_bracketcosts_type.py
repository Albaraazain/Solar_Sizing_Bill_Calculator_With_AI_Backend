# Generated by Django 5.0.2 on 2024-11-29 23:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('solar', '0007_bracketcosts_alter_potentialcustomers_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bracketcosts',
            name='Type',
            field=models.CharField(max_length=15),
        ),
    ]
