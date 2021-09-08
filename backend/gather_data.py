import requests
import re
import urllib.request
import csv


def update_covid_data():
    start_date = '01-01-2020'


    res = urllib.request.urlopen(
        "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/09-02-2021.csv")

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
        if count == 0:
            count += 1
            continue
        elif count > 10:
            break

        data |= {
            row[field_indices['country']]: {
                'states_provinces': {},
                'lat': None,
                'long': None,
                'covid': {}
            }
        }

        country = data.get(row[field_indices['country']])

        if row[field_indices['state_province']]:
            country['states_provinces'].setdefault(
                row[field_indices['state_province']],
                {
                    'lat': row[field_indices['lat']],
                    'lng': row[field_indices['lng']]
                }
            )

        count += 1

        '''
        countries = {
            <COUNTRY_NAME>: {
                lat,
                lng,
                covid: {},
                states_provinces: {
                    <NAME>: {
                        lat,
                        lng,
                        covid: {
                            date:{
                                confirmed, deaths, recovered, active, incident_rate, case_fatality_ratio
                            }, 
                            ... other dates
                        },
                    }, 
                    ... other states/provinces
                }
            }
        }
        '''

        # for index in field_indices:
        #     data[row[3]].update({labels[index]: row[index]})

    print(data)


update_covid_data()
