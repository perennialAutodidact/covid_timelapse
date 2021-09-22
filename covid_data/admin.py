from django.contrib import admin

from .models import Country, StateProvince, CovidDatum


class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')
    search_fields = ['name']

class StateProvinceAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_of_origin', 'latitude', 'longitude')
    search_fields = ['name']



class CovidDatumAdmin(admin.ModelAdmin):
    list_display = ('date', 'country', 'state_province', 'city_county')
    search_fields = ['country__name', 'state_province__name', 'date']

    # def latitude(self, instance):
        

admin.site.register(Country, CountryAdmin)
admin.site.register(StateProvince, StateProvinceAdmin)
admin.site.register(CovidDatum, CovidDatumAdmin)




