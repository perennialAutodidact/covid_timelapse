from django.db import models
from django.db.models.fields.related import ForeignKey
from django.utils.translation import activate, gettext as _


class LocationModel(models.Model):
    name = models.CharField(_('name'), max_length=256)
    latitude = models.DecimalField(
        _('latitude'),
        max_digits=20,
        decimal_places=10
    )
    longitude = models.DecimalField(
        _('longitude'),
        max_digits=20,
        decimal_places=10
    )


class Country(LocationModel):
    class Meta:
        verbose_name_plural = 'countries'
    has_state_provinces = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class StateProvince(LocationModel):
    class Meta:
        verbose_name_plural = 'States/Provinces'
    
    country_of_origin = ForeignKey(
        _('country'),
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class CovidDatum(models.Model):

    class Meta:
        verbose_name_plural = 'Covid Data'

    country = ForeignKey(
        Country,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    state_province = ForeignKey(
        StateProvince,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    city = models.CharField(_('city'), max_length=256, null=True, blank=True)

    date = models.DateField(_('date'))

    confirmed = models.IntegerField(_('confirmed'))
    deaths = models.IntegerField(_('deaths'))
    recovered = models.IntegerField(_('recovered'))
    active = models.IntegerField(_('active'))

    incident_rate = models.DecimalField(
        _('incident rate'),
        max_digits=10,
        decimal_places=10,
        null=True,
        blank=True
    )
    fatality_ratio = models.DecimalField(
        _('fatality ratio'),
        max_digits=10,
        decimal_places=10,
        null=True,
        blank=True
    )

    def __str__(self) -> str:
        location = ''
        
        location += self.country or ''
        
        location += self.state_province or ''
        
        return f"{self.date} - {location}"