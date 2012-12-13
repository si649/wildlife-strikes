/*
**	Time Module
**		Initializer:		initTime();
**		Exposes Events:		None
**							
*/

window.WSR = window.WSR || {};
$.extend(true,WSR,{
	vars: {}
});	

var Timer = (function($,_,d3){	// is "Time" a library name in JS? completely blanking...
	return function(){

		// TO DO: cache incidents data in time module

		// try changeTime(['1999_1'])

		var playInterval = 1000,
			playing = false;
		
		changeTime = function (data) {

			var months = data;

			setTimeout(function() {

				//console.log(months);
			
				// increment time - range: 1999_1 to 2012_7
				incrementTime = function (data) {
					//var months = data;
					console.log('months ' + data);
					months = _.map(months, function(m) {
						if (m != '2012_7') {
							mSplit = m.split('_');
							// increment month if not december
							if (mSplit[1] != '12') m = mSplit[0] + '_' + ++mSplit[1];
							// increment year and set month to january
							else m = ++mSplit[0] + '_' + '1';
						} else {
							// reset to first month in data
							m = '1999_1';
						}
						return m;
					});
					fetchIncidents(months);
				} // END incrementTime

				// load new incident files
				fetchIncidents = function (data) {
					// temporary - ulimately will get this from the data parameter
					var months = data;
					WSR.vars.incidents = {};
					var currentAirports = [];
					// for each month, load the incidents file
					_.each(months, function(m,i) {
						var dataUrl = "data/incidents/" + m + "_incidents.json";
						$.ajax({
							url:dataUrl,
							dataType:"json",
							success: function(data){
								// store incidents json data in global variable
								WSR.vars.incidents[m] = data;
								// merge airports into current airports, removing any duplicates
								currentAirports = _.union(currentAirports, fetchAirports(data));
								// check for final iteration, then update map and global variables
								if (i == months.length - 1) {
									updateMap(currentAirports);
									WSR.vars.date = months;
									WSR.vars.airports = currentAirports;
									console.log(currentAirports.length);
									// if playing, call the settimeout loop
									if (playing) {
										setTimeout(changeTime(months));
									};
								};
							},
							error: function(jqXHR, textStatus, errorThrown){
								console.log(textStatus, errorThrown);
							}
						});
					}); // END month loop
				} // END fetchIncidents

				// extract airports from incident file
				fetchAirports = function (data) {
					// use underscore chaining to return unique array of airports
					return _.chain(data).pluck('AIRPORT_ID').flatten().uniq().without(undefined).value();
				} // END fetchAirports
				
				// trigger map, sending array of current airports to map module
				updateMap = function (data) {
					WSR.vars.map.trigger('updateAirports', [data]);
				}

				incrementTime(months);
			
			}, playInterval); // END setTimeout
		
		}; //END play 
		
		// allow user to start/stop time's auto-increment
			
		// allow user's to select time value / range
			
		// draw widgets, activate listeners on widgets
		
		
		// Constructor Function
		this.initTime = function(parent) {

			// start the time change "loop"  -> check out d3's Timer, or just setInterval
			
			//Starting by just testing if we could setInterval to print the date on the screen
			var failed = 0, interval = 1000; //for error handling
			var date = 1999;
			function stepThroughDates(interval){
				interval = interval || 1000; // default polling to 1 second

			   	setTimeout(function(){
			       $.ajax({
			           //url: 'foo.htm',
			           success: function( response ){

			           		curMsg = date.toString();
							// //This doesn't work
							//document.getElementById("stepDate").innerHTML = curMsg

							// //This does work
							//alert(curMsg);
							date ++;

							stepThroughDates(interval); // recurse
			           },
			           error: function(jqXHR, textStatus, errorThrown){
			           		console.log(textStatus, errorThrown);
							if( ++failed < 10 ){
								// give the server some breathing room by
								// increasing the interval
								interval = interval + 1000;
								stepThroughDates(interval); // recurse
							}//end of if
						}//end of error
			       });

			   	}, interval);//end of setTimeout
			} //)(); //end of stepThroughDates







			// call function to send airport array to map - this will definitely change
			$(".testbutton").on("click", function(ev) {
				incrementTime();
				fetchIncidents();
				//console.log(currentAirports);
				//updateMap(currentAirports);
				stepThroughDates();
			})

			// call function to draw widgets

			//Call the function to build the time line
			buildTimeLine()

		} // END initTime()
		
		//NIKKI DON'T GO ABOVE THIS!
		//This is the function to build the 
		function buildTimeLine () {

			var margin = {top: 10, right: 10, bottom: 100, left: 40},
		    width = 960 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom,
		    barPadding = 1;

			var parseDate = d3.time.format("%Y_%m").parse;

			var x = d3.time.scale().range([0, width]),
			    y = d3.scale.linear().range([height, 0]);

			var xAxis = d3.svg.axis().scale(x).orient("bottom"),
			    yAxis = d3.svg.axis().scale(y).orient("left");

			var brush = d3.svg.brush()
			    .x(x)
			    .on("brush", brush);

			var svg = d3.select("body").append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom);

			var brushChart = svg.append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			// d3.csv("sp500.csv", function(error, data) {
			// d3.json("../Data/incidents/1999_10_incidents.json", function(error, data) {
			d3.json("../Data/incidents/totalincidents.json", function(error, data) {

			  //Need to format the dates for chart
			  data.forEach(function(d) {
			    d.chartDate = parseDate(d.date);
			    d.hits = +d.hits;
			  });

			  //Once we have a date, now sort
			  data.sort(function(a,b) { return a.chartDate-b.chartDate; });

			  //Setting up the scales for the charts
			  x.domain(d3.extent(data.map(function(d) { return d.chartDate; })));
			  y.domain([0, d3.max(data.map(function(d) { return d.hits; }))]);

			  brushChart.selectAll(".brushBars")
			      .data(data)
			    .enter().append("rect")
			      .attr("class", "brushbar")
			      .attr("fill", "black")
			      .attr("x", function(d, i) { return i * (width/data.length);})
			      .attr("width",(width/data.length) - barPadding)
			      .attr("y", function(d) { return y(d.hits); })
			      .attr("height", function(d) { return height - y(d.hits); });

			  brushChart.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);

			  brushChart.append("g")
			      .attr("class", "y axis")
			      .call(yAxis);

			  brushChart.append("g")
			      .attr("class", "x brush")
			      .call(brush)
			    .selectAll("rect")
			      .attr("y", -6)
			      .attr("height", height + 7);
			});

			function brush() {

			  //Find out how many months there are between the brush extent
			  var arrayOfDates = function( date1, date2 ) {
			    //Make new dates from the given ones, set for first of the month year
			    var d1 = new Date(date1.getFullYear(), date1.getMonth(), 1);
			    var d2 = new Date(date2.getFullYear(), date2.getMonth(), 1);
			    var one_month=1000*60*60*24*30;


			    var monthsBetween = Math.floor(Math.abs(((d1 - d2)/one_month)));

			    //Given the number of months btw the two dates construct an array with our date format
			    var monthsArray = [];

			    //We'll be incrimenting over date one
			    var month = d1.getMonth() + 1; //b/c this is index 0-11 
			    var year = d1.getFullYear();
			    var dateStr = year + "_" + month;

			    //put in the first date
			    monthsArray.push(dateStr);

			    for (var i=0; i < monthsBetween; i++) {
			      if (month != 12) {
			        dateStr = year + '_' + ++month;
			      }
			      // increment year and set month to january
			      else {
			        dateStr = ++year + '_1';
			        month = 1;
			      }
			      console.log(dateStr);
			      monthsArray.push(dateStr);
			    }
			    console.log(monthsArray);
			    return monthsArray;
			  }
			  console.log("call to months between", arrayOfDates(brush.extent()[0],brush.extent()[1]));

			}
			

		}//end of buildTimeLine
		
	} // end return closure
})(jQuery,_,d3);