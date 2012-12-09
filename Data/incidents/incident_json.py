import csv
import json
from collections import defaultdict
import sys

# # This totally works
# f = open( 'incidentdata.csv', 'rU' )
# reader = csv.DictReader( f)
# out = json.dumps( [ row for row in reader ] )
# #json.dumps(out, fo, sort_keys=True, indent=4)
# #print out

# fo = open("incident.json","w")
# fo.write(out)
# fo.close()
###############################################

# f = open('incidentdata.csv','rU')

# data = csv.reader(open('incidentdata.csv','rU'))

# # Read the column names from the first line of the file
# fields = data.next()

# #input array of data
# arr = []

# for row in data:
#         # Zip together the field names and values
#     items = zip(fields, row)
#     item = {}
#         # Add the value to our dictionary
#     for (name, value) in items:
#         item[name] = value.strip()
#         arr.append(item)


# print json.dumps(arr)

# ###################################################

# data = csv.reader(open('StrikeReportCombinedChoppedPost98CleanedRemarks.csv','rU', encoding='utf-8'))


if sys.version < '3': 
    data = csv.reader(open('StrikeReportCombinedChoppedPost98CleanedRemarks.csv','rU'))
else:
    data = csv.reader(open('StrikeReportCombinedChoppedPost98CleanedRemarks.csv','rU', newline='', encoding='utf-8'))

# Read the column names from the first line of the file
fields = data.next()

#dictionary for all the years
fullIncidents = defaultdict(list)

# # ******* For TESTING
# count = 0

for row in data:

    # # ******* For TESTING
    # if count > 15:
    #     break

    # Zip together the field names and values
    items = zip(fields, row)
    year = items[3][1]
    month = items[2][1]
    date = year + '_' + month

    #Dictionary for each incident
    item = {}

    # Add the value to our dictionary
    for (name, value) in items:    	
        item[name] = value.strip()

    # Clean up white space from remarks
    item['REMARKS'] = ' '.join(item['REMARKS'].split())

    # Once that loop for the row is done, dump in right key    
    fullIncidents[date].append(item)

#     # ******* For TESTING
#     count += 1

# # ******* For TESTING
# print json.dumps(fullIncidents, indent = 4)


#Writing all this data out to individual files
for keys in fullIncidents:

    out = json.dumps(fullIncidents[keys], ensure_ascii=False , indent = 4)
    filename = keys + "_incidents.json"

    fo = open(filename,"w")
    fo.write(out)
    print "saved " + filename
    fo.close()

###################################################