import requests
import re

def update_covid_data():
    res = requests.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/09-02-2021.csv")

    res = res.text.split('\n')

    labels = re.split(r',(?=\S)', res[0])


    data={}
    field_indices = [2, 4, 5, 6, 7, 8, 9, 10, 12, 13]

    for row in res[1:-1]:
        row = re.split(r',(?=\S)|,$', row)

        data |= {
            row[3]: {
                'states_provinces':{},
                'lat': None,
                'long': None,
                'covid': {}
            }
        }
        
        '''
        countries = {
            <COUNTRY_NAME>: {
                lat,
                lng,
                covid: {}
                'states_provinces': {
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

        exit()

update_covid_data()