# get unique list of airports
import csv

airports = {}
firstline = True
counter = 0

with open('data/StrikeReportCombined.csv', 'rb') as csvfile:
	strikedata = csv.reader(csvfile)
	for row in strikedata:
		if firstline == True:
			firstline = False
			continue
		if row[25] not in airports:
			name = row[26]
			name = name.replace('ARPT','AIRPORT')
			airports[row[25]] = [name,row[27]]

# write airport dictionary to a file
with open('airports.txt','wb') as f:
	for airport in airports:
		f.write(airport + '\t' + airports[airport][0] + '\t' + airports[airport][1] + '\n')
		counter += 1

print str(counter), 'airports saved'