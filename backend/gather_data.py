import requests
import re
import urllib.request
import csv
from datetime import date, timedelta


def open_csv(url):
    print('url', url)
    try:
        res = urllib.request.urlopen(url)
    except urllib.error.HTTPError:
        return None

    lines = [l.decode('utf-8') for l in res.readlines()]

    return csv.reader(lines)


def count_cols():

    file_date = daterange_start = date(year=2020, month=1, day=22)
    min_cols = 6
    col_counts = []

    file_count = 0

    while True:

        url_date = file_date.strftime('%m-%d-%Y')
        url = f"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{url_date}.csv"
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
    Github CSV columns:
    2020-01-22 - 2020-03-01: 6
    2020-03-02 - 2020-03-22: 8
    2020-03-23 - 2020-05-29: 12
       2020-06-01 - present: 14
    '''

    if number_of_fields >= 12:

        field_indices = {
            "fips": 0,
            "admin2": 1,
            "province_state": 2,
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
            "province_state": 0,
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


def update_covid_data():

    file_date = daterange_start = date(year=2020, month=1, day=22)
    url_date = file_date.strftime('%m-%d-%Y')
    url = f"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{url_date}.csv"

    raw_data = open_csv(url)

    if not raw_data:
        return
    
    data = {}
    labels = list(raw_data)[0]
    field_indices = get_field_indices(len(labels))

    print(field_indices)

    # current_date += timedelta(days=1)
    # count = 0
    # for row in raw_data:
    #     if not count:
    #         count += 1
    #         continue
    #     elif count == 2:
    #         break

    #     print(len(row))

    #     count += 1


print(update_covid_data())

# for item in count_cols():
#     print(item)
