from django.core.management.base import BaseCommand
import urllib.request
import csv
from datetime import date, timedelta
from decimal import Decimal

from covid_data.models import Country, StateProvince, CovidDatum
from covid_data.serializers import CountrySerializer, StateProvinceSerializer, CovidDatumSerializer

from .state_coordinates import state_coordinates
from .country_coordinates import country_coordinates

BASE_URL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports"

COUNTRY_NAMES = {
    'US': 'United States'
}


def open_csv(url):
    '''Open a CSV file at a particular web address and return its contents as a list of lines'''
    print('url', url)
    try:
        res = urllib.request.urlopen(url)
    except urllib.error.HTTPError:
        return None

    lines = [l.decode('utf-8') for l in res.readlines()]

    return csv.reader(lines)


def count_cols():
    '''
    Return a list of strings detailing the number of columns each CSV file has
    '''
    file_date = daterange_start = date(year=2020, month=3, day=22)
    min_cols = 6
    col_counts = []

    file_count = 0

    while True:

        url_date = file_date.strftime('%m-%d-%Y')
        url = f"{BASE_URL}/{url_date}.csv"
        csv_data = open_csv(url)
        # print(file_date.strftime('%m-%d-%Y'))
        if not csv_data:
            return col_counts

        else:
            csv_cols = len(list(csv_data)[0])

            if csv_cols > min_cols:
                col_counts.append(
                    f"{daterange_start} - {file_date}: {min_cols}")
                col_counts.append(
                    f"{daterange_start} - {file_date}: {min_cols}")
                daterange_start = file_date + timedelta(days=1)
                min_cols = csv_cols
            else:
                if file_count % 3 == 0:
                    char = '/'
                elif file_count % 3 == 1:
                    char = '|'
                elif file_count % 3 == 2:
                    char = '\\'
                print(f"\r{file_count} {char}", end='')

            file_count += 1
            file_date += timedelta(days=1)


def get_field_indices(number_of_fields):
    '''
    Return a dictionary linking field names to their indices in the CSV columns

    Github CSV columns:
    2020-01-22 - 2020-03-01 ... 6
    2020-03-02 - 2020-03-22 ... 8
    2020-03-23 - 2020-05-29 ... 12
    2020-06-01 - present ...... 14
    '''

    if number_of_fields >= 12:
        field_indices = {
            "fips": 0,
            "admin2": 1,
            "state_province": 2,
            "country": 3,
            "last_update": 4,
            "latitude": 5,
            "longitude": 6,
            "confirmed": 7,
            "deaths": 8,
            "recovered": 9,
            "active": 10,
            "combined_key": 11,
        }
        if number_of_fields == 14:
            field_indices |= {
                "incidence_rate": 12,
                "fatality_ratio": 13,
            }

    elif number_of_fields >= 6:
        field_indices = {
            "state_province": 0,
            "country": 1,
            "last_update": 2,
            "confirmed": 3,
            "deaths": 4,
            "recovered": 5,
        }

        if number_of_fields == 8:
            field_indices |= {
                "latitude": 6,
                "longitude": 7,
            }

    return field_indices


def should_skip_record(row, field_indices):
    '''
    Some records need to be skipped because they 
        a) aren't countries/states/provinces (Diamond Princess Cruise Ship, Summer Olympics 2020, etc)
        b) are missing latitude/longitude fields
    '''
    EXCLUDED_REGIONS = [
        'diamond princess',
        'summer olympics',
        'ms zaandam'
    ]
    for region in EXCLUDED_REGIONS:
        if region in row[field_indices['country']].lower(): 
            print(row)
            return True

    return False


class Command(BaseCommand):
    help = "Populate DB with Covid data"

    def handle(self, *args, **options):
        file_date = daterange_start = date(year=2021, month=9, day=8)
        url_date = file_date.strftime('%m-%d-%Y')
        url = f"{BASE_URL}/{url_date}.csv"

        raw_data = open_csv(url)

        if not raw_data:
            return

        country_names = []
        row_count = 0
        for row in raw_data:
            if row_count == 0:
                field_indices = get_field_indices(len(row))
                row_count += 1
                continue

            if should_skip_record(row, field_indices): continue

            country_name = row[field_indices['country']]
            # Regulate a few country names to match data sets
            if country_name not in country_names:
                if country_name == 'Taiwan*':
                    country_name = 'Taiwan'
                country_names.append(country_name)

            if country_name == 'US':
                country_name = 'United States'

            latitude=row[field_indices['latitude']]
            longitude=row[field_indices['longitude']]

            if not latitude or not longitude:
                state_province_name = row[field_indices['state_province']]

                if state_province_name in state_coordinates.keys():
                    latitude = state_coordinates.get(state_province_name)['latitude']
                    longitude = state_coordinates.get(state_province_name)['longitude']
                else:
                    country_coords =  country_coordinates.get(country_name)

                    if not country_coords:
                        print(row)
                        continue

                    latitude = country_coords['latitude']
                    longitude = country_coords['longitude']

                row[field_indices['latitude']] = latitude
                row[field_indices['longitude']] = longitude


            country = Country.objects.filter(name=country_name)
            if not country:
                new_country = Country.objects.create(
                    name=country_name,
                    latitude=Decimal(row[field_indices['latitude']]),
                    longitude=Decimal(row[field_indices['longitude']])
                )


            state_province_name = row[field_indices['state_province']]
            
            if state_province_name:
                state_province = StateProvince.objects.filter(
                    name=state_province_name)

                if not state_province:
                    country_name = row[field_indices['country']]
                    if country_name == 'US':
                        country_name = 'United States'

                    country_of_origin = Country.objects.filter(name=country_name).first()

                    if not country_of_origin:
                        print(state_province_name, country_name)

                    new_state_province = StateProvince.objects.create(
                        name=state_province_name,
                        latitude=row[field_indices['latitude']],
                        longitude=row[field_indices['longitude']],
                        country_of_origin = country_of_origin or None
                    )

            # print(row)
        row_count += 1
