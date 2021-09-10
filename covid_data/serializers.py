from rest_framework import serializers

from .models import Country, StateProvince, CovidDatum


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'


class StateProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StateProvince
        fields = '__all__'


class CovidDatumSerializer(serializers.ModelSerializer):
    class Meta:
        model = CovidDatum
        fields = '__all__'
