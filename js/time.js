/*Time module to do:
* map listens for a change from time (e.g. see 'updatelines')
* map updates its data to just those current airports - where should map hold the list of current airports?
* time triggers a change with data -- an array of airports
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

var Time = (function($,_,d3){	// is "Time" a library name in JS? completely blanking...
	return function(){
		
		// other function stuff goes here
			
			// increment time, ajax new incident, update globals, trigger map
			
			// simple function (for now) to send array of current airports to map module
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

			// call function to send airport array to map - this will definitely change
			$(".testbutton").on("click", function(ev) {
				updateTime();
			})

			// call function to draw widgets
			
			
		} // END initTime()
		
	} // end return closure
})(jQuery,_,d3);