from rest_framework import serializers

from .models import CovidDatum

class CovidDatumCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CovidDatum
        fields = '__all__'

    