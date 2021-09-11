from django.contrib import admin

from .models import Country, StateProvince, CovidDatum


class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')

class StateProvinceAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_of_origin', 'latitude', 'longitude')

class StateProvinceAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')

admin.site.register(Country, CountryAdmin)
admin.site.register(StateProvince, StateProvinceAdmin)
admin.site.register(CovidDatum)




