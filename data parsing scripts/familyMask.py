# create masks of the animal families based on the presence of strikes in each year/month

import pandas as pd
from pandas import DataFrame,Series
import numpy
import json

data = pd.read_csv("data/StrikeReportCombined.csv")

# split out the columns that count
animals = data[['INCIDENT_MONTH','INCIDENT_YEAR','SPECIES_ID','AIRPORT_ID']]
# remove dates before 1999
yearMask = animals['INCIDENT_YEAR'].apply(lambda x: x > 1998)
animals = animals[yearMask]
# add family column
animals['FAMILY'] = animals['SPECIES_ID'].apply(lambda x: x[0])
byfamily = animals.groupby('FAMILY')
strikes = dict()
for family in byfamily:
	id = family[0]
	#replace numerical ids
	if id == '1': id = "A"
	if id == '2': id = "B"
	
	strikes[id] = dict() # create dictionary for this family's mask
	years = family[1].groupby('INCIDENT_YEAR')
	ydict = {y[0]:y[1] for y in years}
	for year in range(1999,2013): #range is not r-inclusive
		if year in ydict:
			months = ydict[year].groupby('INCIDENT_MONTH')
			mdict = {m[0]:m[1] for m in months}
			
			strikes[id][str(year)] = []
			for month in range(1,13): #range is not r-inclusive
				if month in mdict:
					#make sure all airports are not UNK or PVT
					airports = list(set([airport[0] for airport in mdict[month].groupby('AIRPORT_ID') if not(airport[0] == 'UNK') and not(airport[0] == 'PVT')]))
					if(len(airports) > 0): 
						strikes[id][str(year)].append(1)
					else:
						strikes[id][str(year)].append(0)
				else:
					strikes[id][str(year)].append(0)
		else:
			vals = [0] * 12 # 12 months in the year
			strikes[id][str(year)] = vals;
		
print strikes
		