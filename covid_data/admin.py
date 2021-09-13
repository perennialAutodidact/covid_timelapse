from django.contrib import admin

from .models import Country, StateProvince, CovidDatum


class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')
    search_fields = ['name']

class StateProvinceAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_of_origin', 'latitude', 'longitude')
    search_fields = ['name']

class CovidDatumAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')

admin.site.register(Country, CountryAdmin)
admin.site.register(StateProvince, StateProvinceAdmin)
admin.site.register(CovidDatum)




