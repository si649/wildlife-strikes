import csv

airports = {}
errors = {}
bad = ['error','Agua Dulce Airpark',"Mario's Flying Pizza Airport",'Comfort Airpark Airport-17te','Gardiner Airport','Poco Loco', \
		'Devils Hopyard Field-Ct11','Elk River Airport','Noblesville Airport','Robertson Farm Airport-Tn94', 'Nemacolin Woodlands Resort']

# get geocoded airports
# separate good results from bad results
with open('data/geocoded_1999.txt','U') as csvfile:
	airportdata = csv.reader(csvfile, delimiter='\t')
	for row in airportdata:
		ID = row[0]
		if row[2] not in bad:
			name = row[1].title()
			lat = row[3]
			lng = row[4]
			addy = row[5]
			airports[ID] = (name, lat, lng, addy)
		else:
			errors[ID] = row[1]

# write good results to geojson format
with open('data/airports.json','w') as f:
	counter = 1
	f.write('{"type":"FeatureCollection","features":[')
	for airport in airports:
		#print airport, airports[airport][0], airports[airport][3], airports[airport][2], airports[airport][1]
		geo = ('{"type":"Feature","id":"' + airport + '","properties":{"name":"' +
				airports[airport][0] + '","address":"' + airports[airport][3] +
				'"},"geometry":{"type":"Point","coordinates":[' + airports[airport][2] +
				',' + airports[airport][1] + ']}}')
		if counter < len(airports):
			f.write(geo + ',')
			counter += 1
		else:
			f.write(geo)
	f.write(']}')

# write bad results in tab-separated format
with open('data/errors.txt','wb') as f:
	for error in errors:
		f.write(error + '\t' + errors[error] + '\n')