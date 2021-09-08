import requests
import re
import urllib.request
import csv


def update_covid_data():
    start_date = '01-01-2020'

    '''
    Github CSV columns:
    2020-01-01 - 2020-xx-xx: 6
    2020-

    '''

    try:
        res = urllib.request.urlopen(
            "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/02-28-2020.csv")
    except urllib.error.HTTPError:
        return '404!'


    lines = [l.decode('utf-8') for l in res.readlines()]

    raw_data = csv.reader(lines)

    data = {}
    field_indices = {
        'state_province': 2,
        'country': 3,
        'last_updated': 4,
        'lat': 5,
        'lng': 6,
        'confirmed': 7,
        'deaths': 8,
        'recovered': 9,
        'active': 10,
        'incident_rate': 12,
        'fatality_ratio': 13
    }

    count = 0
    for row in raw_data:
        if not count:
            count += 1
            continue
        elif count == 2:
            break
        
        print(len(row))

        count += 1
    


print(update_covid_data())
