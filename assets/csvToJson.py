import csv, json
cities = []
with open('worldCities.csv') as c:
    r = csv.reader(c)
    for row in r:
        cities.append(row)

names = [c[0] for c in cities[1:]]  # for 

with open('cityNames.json', 'w') as f:
    json.dump(names, f)

namesIt = [c[0] for c in cities if c[5] == 'IT']
with open('cityNamesIT.json', 'w') as f:
    json.dump(namesIt, f)


