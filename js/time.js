/*Time module to do:
* once i have that working, get time to look at incidents.json for the given date,
  pull out airports, and put them in an array that is then passed to map
*/

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
		
		// other function stuff goes here
			
			// increment time

			// ajax new incident file

			// extract airports from incident file

			// update globals: date and current airports
			
			// trigger map, sending array of current airports to map module
			updateTime = function () {
				var airports = ['KDDC','KVQQ','6B6'];
				WSR.vars.map.trigger('updateAirports', [airports]);
			}
		
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
				updateTime();
				stepThroughDates();
			})

			// call function to draw widgets
			
			
		} // END initTime()
		
	} // end return closure
})(jQuery,_,d3);