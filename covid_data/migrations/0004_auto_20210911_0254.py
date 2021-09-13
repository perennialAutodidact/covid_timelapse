# Generated by Django 3.2.7 on 2021-09-11 02:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('covid_data', '0003_auto_20210909_2253'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationmodel',
            name='latitude',
            field=models.DecimalField(decimal_places=10, max_digits=20, verbose_name='latitude'),
        ),
        migrations.AlterField(
            model_name='locationmodel',
            name='longitude',
            field=models.DecimalField(decimal_places=10, max_digits=20, verbose_name='longitude'),
        ),
    ]