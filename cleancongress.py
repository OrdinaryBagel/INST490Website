import pandas as pd
import json
import urllib.request
congressmen = pd.read_json('https://unitedstates.github.io/congress-legislators/legislators-current.json')
url = 'https://unitedstates.github.io/congress-legislators/committee-membership-current.json'

with urllib.request.urlopen(url) as response:
    committee = json.loads(response.read().decode("utf-8"))

membership = {}
for i in committee:
    for k in committee[i]:
            temp = membership.get(k['name'])
            if temp is not None:
                 membership[k['name']].append(i)
            else:
                 membership[k['name']] = [i]
currcongress = {}
for i in range(0,len(congressmen)):
    if congressmen['name'][i].get('official_full'):
        name = congressmen['name'][i]['official_full']
    else:
        name = congressmen['name'][i]['first'] + ' '+ congressmen['name'][i]['last']
    state = congressmen['terms'][i][-1]['state']
    address = congressmen['terms'][i][-1]['address']
    phone = congressmen['terms'][i][-1]['phone']
    website = congressmen['terms'][i][-1]['url']
    if congressmen['terms'][i][-1].get('contact_form') is not None:
        contact = congressmen['terms'][i][-1]['contact_form']
    else:
        contact = ""
    if congressmen['terms'][i][-1]['type'] == 'sen':
        seat = 'Senator'
    elif congressmen['terms'][i][-1]['type'] == 'rep':
        seat = 'Represenative:' + str(congressmen['terms'][i][-1]['district'])
    else:
        seat = 'other'
    if membership.get(name) is not None:
        currcongress[name] = {'State': state, 'Seat': seat, 'Address': address,
                              'Phone': phone, 'Contact': contact, 'Website': website,
                              'Committe': membership[name]}
    else:
        currcongress[name] = {'State': state, 'Seat': seat, 'Address': address,
                                      'Phone': phone, 'Contact': contact, 'Website': website,
                                      'Committe': {}}
currdf = pd.DataFrame(currcongress)
for i in currcongress:
    print(f'{i} {currcongress[i]}')