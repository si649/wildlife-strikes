//Time module where it controls:
/* set of airports, sends that to map, so map is dependent on time for what to display

Right now go through incident files and pull out airport IDS and send to map, so map only draws those*/

/*
**	Time Module
**		Initializer:		initTime();
**		Exposes Events:		None
**							
*/

window.WSR = window.WSR || {};
$.extend(true,WSR,{
	vars: {}
	date:{}  // declare now that we will use it, set it later
});	

var Time = (function($,_,d3){	// is "Time" a library name in JS? completely blanking...
	return function(){
		
		// other function stuff goes here
			
			// increment time, ajax new incident, update globals, trigger map
		
			// allow user to start/stop time's auto-increment
			
			// allow user's to select time value / range
			
			// draw widgets, activate listeners on widgets
		
		
		// Constructor Function
		this.initTime = function() {
			// start the time change "loop"  -> check out d3's Timer, or just setInterval
			
			// call function to draw widgets
			
			
		} // END initTime()
		
	} // end return closure
})(jQuery,_,d3);