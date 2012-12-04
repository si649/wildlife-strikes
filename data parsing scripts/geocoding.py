##########################################################################################
##########################################################################################
# CHANGE THESE SETTINGS

# subset airports to be geocoded - upperBound is inclusive
# I recommend doing 75 per api per day
lowerBound = 1975
upperBound = 2025

# add your own API key
api = API

# make sure airports.txt and geocoding.py are in the same directory
# run it!

##########################################################################################
##########################################################################################

import csv
import urllib2
import json
import datetime
import pickle


airports = {}

# create unique file name to avoid overwriting previous files
now = datetime.datetime.now()
output = 'geocoded-' + now.strftime("%d-%H-%M-%S") + '.txt'
pickleOut = 'pickled-' + now.strftime("%d-%H-%M-%S") + '.pkl'

# counter to subset airports
currentRow = 0

# read in a chunk of airport data (segmented because of API limit)
with open('airports.txt','rb') as csvfile:
	airportdata = csv.reader(csvfile, delimiter='\t')
	for row in airportdata:
		if currentRow >= lowerBound and currentRow <= upperBound:
			airports[row[0]] = row[1:3]
		currentRow += 1

#######################################

# query Google Places API to get locations for each airport (API limit is 1000 per day)
url1 = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query='
url2 = '&types=airport&sensor=false&key=' + api
results = {}

for k,v in airports.items():
	name = v[0].replace(' ','+')
	if v[1] == 'N/A':
		request = url1 + k + '+' + name + url2
	else:
		request = url1 + k + '+' + name + '+' + v[1] + url2
	response = urllib2.urlopen(request)
	result = json.JSONDecoder().decode(response.read())
	if result['status'] == 'ZERO_RESULTS':
		print result
		if v[1] == 'N/A':
			request = url1 + name + url2
		else:
			request = url1 + name + '+' + v[1] + url2
		response = urllib2.urlopen(request)
		result = json.JSONDecoder().decode(response.read())
	results[k] = result


#######################################

# save the dictionary object as a backup

pickled = open(pickleOut, 'wb')
pickle.dump(results, pickled)
pickled.close()

# access data from pickle backup, if necessary

# pkl_file = open('myfile.pkl', 'rb')
# results = pickle.load(pkl_file)
# pkl_file.close()

#######################################


# write results to a file
with open(output,'wb') as f:
	for result in results:
		try:
			if not results[result]['results']:
				f.write(result  + '\t' + airports[result][0] + '\t' + 'error' + '\t' + results[result]['status'])
				print result, airports[result][0] + ' - error'
			else:	
				name = results[result]['results'][0]['name']
				lat = results[result]['results'][0]['geometry']['location']['lat']
				lng = results[result]['results'][0]['geometry']['location']['lng']
				address = results[result]['results'][0]['formatted_address']
				f.write(result + '\t' + airports[result][0] + '\t' + name + '\t' + str(lat) + '\t' + str(lng) + '\t' + address)
				print result, airports[result][0] + ' - success'
		except:
			f.write(result  + '\t' + airports[result][0]  + '\t' + 'error' + '\t' + results[result]['status'])
			print result, airports[result][0] + ' - error'
		f.write('\n')

print 'Process complete'