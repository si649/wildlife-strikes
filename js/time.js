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

var Timer = (function($,_,d3){
	return function(){

		var incidents = {},
			timeInterval = [],
			playInterval = 1000,
			playing = false,
			forward = false,
			backward = false;
		
		updateTime = function (data) {

			var months1 = data;

			// increment time - range: 1999_1 to 2012_7
			incrementTime = function (data) {
				var months2 = data;
				if (playing || forward) {
					months2 = _.map(months2, function(m) {
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
					timeInterval = months2;
				};
				if (backward) months2 = decrementTime(months2);
				fetchIncidents(months2);
			}; // END incrementTime

			decrementTime = function (data) {
				var months4 = data;

				months4 = _.map(months4, function(m) {
					if (m != '1999_1') {
						mSplit = m.split('_');
						// decrement month if not january
						if (mSplit[1] != '1') m = mSplit[0] + '_' + --mSplit[1];
						// decrement year and set month to december
						else m = --mSplit[0] + '_' + '12';
					} else {
						// reset to first month in data
						m = '2012_7';
					}
					return m;
				});
				timeInterval = months4;

				return months4;

			}; // END decrementTime

			// load new incident files
			fetchIncidents = function (data) {
				var months3 = data;

				// reset local and global variables
				WSR.vars.incidents = {};
				var currentAirports = [];

				// for each month, load the incidents file
				_.each(months3, function(m,i) {
					// check if incidents data already exists
					if (m in incidents) updateIncidents(incidents[m],m,i);
					else {
						var dataUrl = "data/incidents/" + m + "_incidents.json";
						$.ajax({
							url:dataUrl,
							dataType:"json",
							success: function(data){
								// store incidents json data in local variable
								incidents[m] = data;
								updateIncidents(data,m,i);
							},
							error: function(jqXHR, textStatus, errorThrown){
								console.log(textStatus, errorThrown);
							}
						}); // END ajax
					}; // END else
				}); // END month loop

				updateIncidents = function (data,m,i) {
					// store incidents in global variable
					WSR.vars.incidents[m] = data;
					// merge airports into current airports, removing any duplicates
					currentAirports = _.union(currentAirports, fetchAirports(data));
					// check for final iteration, then update map and global variables
					if (i == months3.length - 1) {
						// trigger change in map module
						updateMap(currentAirports);
						// update global variables
						WSR.vars.date = months3;
						WSR.vars.airports = currentAirports;
						// trigger time update
						updateTimeView(months3);
						// toggle forward / backward off
						if (forward) forward = false;
						if (backward) backward = false;
						// if playing, call the loop
						if (playing) {
							setTimeout(function() {updateTime(months3)}, playInterval);
						};
					};
				}; // END updateIncidents

			}; // END fetchIncidents

			// extract airports from incident file
			fetchAirports = function (data) {
				// use underscore chaining to return unique array of airports
				return _.chain(data).pluck('AIRPORT_ID').flatten().uniq().without(undefined).value();
			}; // END fetchAirports
			
			// trigger map, sending array of current airports to map module
			updateMap = function (data) {
				WSR.vars.map.trigger('updateAirports', [data]);
			}; // END updateMap

			updateTimeView = function (data) {
				console.log('CURRENT TIME INTERVAL: ' + data);
			}; // END updateTimeView

			// start the whole she-bang
			incrementTime(months1);
		
		}; //END updateTime
		
		// Constructor Function
		this.initTime = function(parent) {

			// play / pause
			$(".playbutton").on("click", function(ev) {
				if (playing) playing = false;
				else {
					playing = true;
					updateTime(timeInterval);
				}
			});

			// forward
			$(".forwardbutton").on("click", function(ev) {
				forward = true;
				updateTime(timeInterval);
			});

			// forward
			$(".backwardbutton").on("click", function(ev) {
				backward = true;
				updateTime(timeInterval);
			});

			//Call the function to build the time line
			buildTimeLine()

		} // END initTime()
		
		//NIKKI DON'T GO ABOVE THIS!
		//This is the function to build the 
		function buildTimeLine () {

			var margin = {top: 10, right: 10, bottom: 10, left: 10},
		    width = 1050 - margin.left - margin.right,
		    height = 150 - margin.top - margin.bottom,
		    barPadding = 1;

			var parseDate = d3.time.format("%Y_%m").parse;

			var x = d3.time.scale().range([0, width]),
			    y = d3.scale.linear().range([height, 0]);

			var xAxis = d3.svg.axis().scale(x).orient("bottom");
			    // yAxis = d3.svg.axis().scale(y).orient("left");

			var brush = d3.svg.brush()
			    .x(x)
			    .on("brush", brush);

			var svg = d3.select("body").append("svg")
				.attr("class", "timeline")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom);

			//rectangle for back of chart
			svg.append("rect")
				.attr("class", "timelineBackground")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom);

			var brushChart = svg.append("g")
			    .attr("transform", "translate(" + margin.left + ", 0)"); // + margin.top + ")");

			// d3.csv("sp500.csv", function(error, data) {
			// d3.json("../Data/incidents/1999_10_incidents.json", function(error, data) {
			d3.json("Data/incidents/totalincidents.json", function(data, error) {

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

			  // brushChart.append("g")
			  //     .attr("class", "y axis")
			  //     .call(yAxis);

			  brushChart.append("g")
			      .attr("class", "brush") //was "x brush"
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
			  timeInterval = arrayOfDates(brush.extent()[0],brush.extent()[1]);
			  console.log("call to months between", timeInterval);
			  updateTime(timeInterval);

			}//end of brush

			function clearBrushing() {


			}//end of clearBrushing

			// call function to reset brushing
			$(".resetBrush").on("click", function(ev) {
				clearBrushing();
			})
			

		}//end of buildTimeLine
		
	} // end return closure
})(jQuery,_,d3);