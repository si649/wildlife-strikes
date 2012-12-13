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

		// TO DO: fix settimeout, cache incidents data in time module

		// try play(['1999_1'])

		var playInterval = 1000,
			playing = true;
		
		play = function (data) {

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
										setTimeout(play(months));
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
			
			
		} // END initTime()
		
	} // end return closure
})(jQuery,_,d3);