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
			backward = false,
			moveBrush,
			showPosition;
		
		updateTime = function (data) {

			var months = data;
			var currentAirports = [];

			//console.log('starting time - updateTime: ' + months);

			// increment time - range: 1999_1 to 2012_7
			incrementTime = function () {
				if (playing || forward) {
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

				//console.log('after incrementTime - playing or forward: ' + months);

				};
				if (backward) decrementTime();
				fetchIncidents();
			}; // END incrementTime

			decrementTime = function () {
				months = _.map(months, function(m) {
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

				//console.log('after decrementTime: ' + months);

			}; // END decrementTime

			// load new incident files
			fetchIncidents = function () {
				// reset local and global variables
				WSR.vars.incidents = {};
				//var currentAirports = [];

				// for each month, load the incidents file
				_.each(months, function(m,i) {
					// check if incidents data already exists
					if (m in incidents) updateIncidents(incidents[m],m,i);
					else {
						var dataUrl = "data/incidents/" + m + "_incidents.json";
						$.ajax({
							url:dataUrl,
							dataType:"json",
							success: function(jsondata){
								// store incidents json data in local variable
								incidents[m] = jsondata;
								updateIncidents(jsondata,m,i);
							},
							error: function(jqXHR, textStatus, errorThrown){
								console.log(textStatus, errorThrown);
							}
						}); // END ajax
					}; // END else
				}); // END month loop
			}; // END fetchIncidents

			updateIncidents = function (jsondata,m,i) {
				// store incidents in global variable
				WSR.vars.incidents[m] = jsondata;
				// merge airports into current airports, removing any duplicates
				currentAirports = _.union(currentAirports, fetchAirports(jsondata));
				// check for final iteration, then update map and global variables
				if (i == months.length - 1) {
					//console.log('updateIncidents final month: ' + months);
					// trigger change in map module
					updateMap(currentAirports);
					// update local time variable
					timeInterval = months;
					// update global variables
					WSR.vars.date = months;
					WSR.vars.airports = currentAirports;
					// trigger time update
					updateTimeView();
					// toggle forward / backward off
					if (forward) {
						moveBrush(true);
						forward = false;
					};
					if (backward) {
						moveBrush(false);
						backward = false;
					};
					// if playing, call the loop
					if (playing) {
						moveBrush(true);
						//console.log('playing is on - before setTimeout: ' + months);
						setTimeout(function() {updateTime(months)}, playInterval);
					};
				};
			}; // END updateIncidents

			// extract airports from incident file
			fetchAirports = function (jsondata) {
				// use underscore chaining to return unique array of airports
				return _.chain(jsondata).pluck('AIRPORT_ID').flatten().uniq().without(undefined).value();
			}; // END fetchAirports
			
			// trigger map, sending array of current airports to map module
			updateMap = function (airportdata) {
				WSR.vars.map.trigger('updateAirports', [airportdata]);
			}; // END updateMap

			// update time display in UI controls
			updateTimeView = function () {
				console.log('CURRENT TIME INTERVAL: ' + months);
				var firstMonth = months[0].split('_');
				var monthDisplay = firstMonth[1] + '/' + firstMonth[0];
				if (months.length > 1) {
					var lastMonth = months[months.length - 1].split('_');
					monthDisplay += ' - ' + lastMonth[1] + '/' + lastMonth[0];
				};
				$("#date span").html(monthDisplay);

				// update play position marker
				showPosition(firstMonth[1],firstMonth[0]);

			}; // END updateTimeView

			// start the whole she-bang
			incrementTime();
		
		}; //END updateTime
		
		// Constructor Function
		this.initTime = function(parent) {

			var defaultTime = ['2009_1'];

			// play / pause
			$(".playbutton").on("click", function(ev) {
				if (playing){
					playing = false;
					$(this).removeClass("active").children('span').attr('class','icon-play');
				}
				else {
					playing = true;
					$(this).addClass("active").children('span').attr('class','icon-pause');
					updateTime(timeInterval);
				}
				WSR.vars.map.trigger("clearLines");
			});

			// forward
			$(".forwardbutton").on("click", function(ev) {
				WSR.vars.map.trigger("clearLines");
				forward = true;
				updateTime(timeInterval);
			});

			// forward
			$(".backwardbutton").on("click", function(ev) {
				WSR.vars.map.trigger("clearLines");
				backward = true;
				updateTime(timeInterval);
			});

			// reset
			$(".clearbrushingbutton").on("click", function(ev) {
				WSR.vars.map.trigger("clearLines");
				updateTime(defaultTime);
			});

			//Call the function to build the time line
			buildTimeLine()

			updateTime(defaultTime);
		
		
		} // END initTime()
		
		//NIKKI DON'T GO ABOVE THIS!
		//This is the function to build the 
		function buildTimeLine () {

			var margin = {top: 10, right: 0, bottom: 0, left: 0},
		    width = 550 - margin.left - margin.right,
		    height = 30 - margin.top - margin.bottom,
		    barPadding = 1,
		    timelineLength;

			var parseDate = d3.time.format("%Y_%m").parse;

			var x = d3.time.scale().range([0, width]),
			    y = d3.scale.linear().range([height, 0]);

			var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(2).tickPadding(0);

			var brush = d3.svg.brush()
			    .x(x)
			    .on("brushstart", function(d) {
			    	WSR.vars.map.trigger("clearLines");
			    })
			    .on("brush", brush);

			var svg = d3.select("#timeControler #graph").append("svg")
				.attr("class", "timeline")
			    .attr("width", width)
			    .attr("height", height + margin.top + margin.bottom);

			// //rectangle for back of chart
			// svg.append("rect")
			// 	.attr("class", "timelineBackground")
			// 	.attr("x",-10)
			// 	.attr("y",-10)
			//     .attr("width", width + margin.left + margin.right + 20 )
			//     .attr("height", height + margin.top + margin.bottom + 20);

			var brushChart = svg.append("g")
			    .attr("transform", "translate(" + margin.left + ","+margin.top+" )"); // + margin.top + ")");

			// d3.csv("sp500.csv", function(error, data) {
			// d3.json("../Data/incidents/1999_10_incidents.json", function(error, data) {
			d3.json("Data/incidents/totalincidents.json", function(data, error) {

			  //Need to format the dates for chart
			  data.forEach(function(d) {
			    d.chartDate = parseDate(d.date);
			    d.hits = +d.hits;
			  });

			  // get overall length for use by other functions
			  timelineLength = data.length;

			  //Once we have a date, now sort
			  data.sort(function(a,b) { return a.chartDate-b.chartDate; });

			  //Setting up the scales for the charts
			  x.domain(d3.extent(data.map(function(d) { return d.chartDate; })));
			  y.domain([0, d3.max(data.map(function(d) { return d.hits; }))]);

			  // draw bars for each month
			  brushChart.selectAll(".brushBars")
			      .data(data)
			    .enter().append("rect")
			      .attr("class", "brushbar")
			      .attr("fill", "black")
			      .attr("x", function(d, i) { return i * (width/data.length);})
			      .attr("width",(width/data.length) - barPadding)
			      .attr("y", function(d) { return y(d.hits); })
			      .attr("height", function(d) { return height - y(d.hits); });

			  // draw x axis
			  d3.select("#timeControler").insert("svg","#toolbarbottom")
			  	 .attr("width", width + margin.left + margin.right)
			  	 .attr("height", "10")
			  	  .attr("transform", "translate(" + margin.left + ", -20px)") // + margin.top + ")")
			      .attr("class", "x axis")
			      .call(xAxis);

			  // draw brushing
			  brushChart.append("g")
			      .attr("class", "brush") //was "x brush"
			      .call(brush)
			    .selectAll("rect")
			      .attr("y", -16)
			      .attr("height", height + 17);

			  var markerMove = function(d) {
			  		var point = d3.mouse(this);
			  		svg.select(".playposition")
			  	  		.attr("x", point[0]);
			  	  	// var timeDelta = Math.floor(point[0] * data.length/width);	  	  	
			  	  	// var monthDelta = timeDelta % 12;
			  	  	// var yearDelta = Math.floor(timeDelta/12);

			  	  	// console.log('year: ' + yearDelta, 'month: ' + monthDelta);
			  	  	// var newTime = 1999 + yearDelta + '_' + 1 + monthDelta;
			  	  	// updateTime([newTime]);
			  };

			  var markerTime = function(d) {
			  		var point = d3.mouse(this);
			  	  	var timeDelta = Math.floor(point[0] * data.length/width);	  	  	
			  	  	var monthDelta = timeDelta % 12;
			  	  	var yearDelta = Math.floor(timeDelta/12);

			  	  	console.log('year: ' + yearDelta, 'month: ' + monthDelta);
			  	  	var newTime = String(1999 + yearDelta) + '_' + String(1 + monthDelta);
			  	  	updateTime([newTime]);
			  }

			  // define drag behavior
			  var drag = d3.behavior.drag()
			  				.origin(Object)
			  				.on("drag", markerMove)
			  				.on("dragend", markerTime);

			  // draw play position - default set at 2009_1
			  var playMarker = brushChart.append("g")
			  	  .append("rect")
			  	  .attr("class","playposition")
			  	  .attr("x", function() { return 120 * (width/data.length); })
			  	  .attr("y", -16)
			  	  .attr("height", height + 17)
			  	  .attr("width", (width/data.length) - barPadding)
			  	  .style("fill","#ff9b3e")
			  	  .call(drag);

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
				console.log("Made it into clear brushing function...")
				d3.select(".brush").call(brush.clear());
			}//end of clearBrushing

			// call function to reset brushing
			$(".clearbrushingbutton").on("click", function(ev) {
				clearBrushing();
				WSR.vars.map.trigger("clearLines");
			})	

			// shift brush left or right
			moveBrush = function (right) {
				// get current months
				//console.log('left: ' + brush.extent()[0], 'right: ' + brush.extent()[1]); 
				var leftDate = brush.extent()[0];
				var rightDate = brush.extent()[1];

				// increment or decrement depending on whether 'right' is true
				brush.extent()[0] = leftDate.setMonth( (right? leftDate.getMonth() + 1 : leftDate.getMonth() - 1) );
				brush.extent()[1] = rightDate.setMonth( (right? rightDate.getMonth() + 1 : rightDate.getMonth() - 1) );

				// update brush
				//console.log('new left: ' + leftDate, 'new right: ' + rightDate);
				svg.select(".brush").call(brush.extent([leftDate, rightDate]));

			}; // END moveBrush

			showPosition = function (month,year) {
			  // calculate months and years away from 1999_1
			  var yearDelta = year - 1999;
			  var monthDelta = month - 1;

			  var xDelta = yearDelta * 12 + monthDelta;

			  console.log('time from 1999_1: ' + xDelta);

			  // update play position marker
			  svg.select(".playposition")
			  	  .attr("x", function() { return xDelta * (width/timelineLength) });
			}; // END showPosition

		}; //END buildTimeLine
		
	} // END return closure
})(jQuery,_,d3);