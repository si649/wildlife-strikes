/*
**	Map Module
**		Initializer:		initMap("DOM_REFERENCE");
**		Exposes Events:		'strikesByAnimal'	view,airport list
**							'deselectAnimal'	view
**							'updateLines'		view
*/

window.WSR = window.WSR || {};
$.extend(true,WSR,{
	vars: {}
});	

var Map = (function($,_,d3){
	return function(){		
		this.initMap = function(parent) {
			WSR.vars.map = $(parent); // jquery object reference for events
			
			var layer = new L.StamenTileLayer("toner-lite");	// switch to "watercolor" for fun times!
			var map = new L.Map(parent.substr(1, parent.length-1), {
			    center: new L.LatLng(39.810556, -98.556111),
			    zoom: 4
			});
			map.addLayer(layer);
			
			var svg = d3.select(map.getPanes().overlayPane).append("svg");
			
			var chartLines = svg.append("g");	
			var chartNodes = svg.append("g");
			var chartInfoBox = svg.append("g");

			// Use Leaflet to implement a D3 geographic projection.
			function project(x) {
				var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
				return [point.x, point.y];
			}
			
			d3.json("data/airports.json", function(collection) {
				var bounds = d3.geo.bounds(collection),
			    	path = d3.geo.path().projection(project);

			    path.pointRadius(5);

				var airport = chartNodes.selectAll("path")
				    .data(collection.features)
				    .enter().append("path")
					    .attr("class", function (d) { return d.id + " leaflet-zoom-hide"})
					    .on("mouseover", function (d, i) { infobox(d, d3.mouse(this), this); })//infobox)
						.on("mouseout", function (d, i) { infoboxRemove(this); });

				//Constructs the SVG elements for the infobox. Each line of text needs its own element and all of the elements need to be in the same "g" group
				var infoBox = chartInfoBox.append("rect");
				var infoBoxTextAirportID = chartInfoBox.append("text");
				var infoBoxTextAirPortStrikeCount = chartInfoBox.append("text");

				//Adds an infobox on a mouseon event
				function infobox(d, mousePos, path) {

					var airportData = d;
		
					//console.log("This is the x: " + mousePos[0] + " This is the y: " + mousePos[1]);
					
					d3.select(path).style("fill","crimson");
					
					infoBox
						.attr("x", (mousePos[0] + 20) + "px") //+ "px")
						.attr("y", (mousePos[1] - 80) + "px") //+ "px")
						.attr("width", 200)
						.attr("height", 100)
						.attr("opacity", .80)
						.style("fill","white")
						.style("stroke","black");

					infoBoxTextAirportID
						.attr("x", (mousePos[0] + 22) + "px")
						.attr("y", (mousePos[1] - 65) + "px")
						.attr("opacity", 1)
						.text(function (d, i) { return "Airport Code: " + airportData.id; })
						.style("font-size", 14);
						
					infoBoxTextAirPortStrikeCount
						.attr("x", (mousePos[0] + 22) + "px")
						.attr("y", (mousePos[1] - 50) + "px")
						.attr("opacity", 1)
						.text(function (d, i) { return "Airport Name: " + airportData.properties.name; })
						.style("font-size", 14);
							
				}

				//Removes the info box on a mouseout event
				function infoboxRemove(path) {

					d3.select(path).style("fill","teal"); 
					infoBox.attr("opacity",0)
						.attr("x",0)
						.attr("y",0);
					
					infoBoxTextAirportID.attr("opacity", 0);
					infoBoxTextAirPortStrikeCount.attr("opacity", 0);
				}
			
				map.on("viewreset", reset);
				reset();

				// Reposition the SVG to cover the features.
				function reset() {
			      var bottomLeft = project(bounds[0]),
			          topRight = project(bounds[1]);
			  
			      svg.attr("width", topRight[0] - bottomLeft[0])
			          .attr("height", bottomLeft[1] - topRight[1])
			          .style("margin-left", bottomLeft[0] + "px")
			          .style("margin-top", topRight[1] + "px");
			  
			      chartNodes.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      chartLines.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      infoBox.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      infoBoxTextAirportID.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      infoBoxTextAirPortStrikeCount.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      
				    airport.attr("d", path);
				}
				
				
				/* Event Handler for Drawing Lines to Animals */
				WSR.vars.map.on('strikesByAnimal', function(ev,view,airportList) {
					WSR.vars.lastAnimals = $.isArray(WSR.vars.lastAnimal) ? WSR.vars.lastAnimal : [];
					WSR.vars.lastAnimals.push([view,airportList]);
					// THIS NEEDS MORE WORK 
					//	WSR.vars.lastAnimal should end up as an array of {view,airport array} arrays for redraw
					// 
					// 	work needs done to here to make the viewport translation into the RESET function 
					//	to accommodate panning/zooming
					
					// random hexcode -> http://paulirish.com/2009/random-hex-color-code-snippets/
					var lineColor = '#'+Math.floor(Math.random()*16777215).toString(16);
					
					// draw lines for each airport
					var count = 0;
					_.each(airportList, function(airport){
						airportData = _.where(collection.features,{id:airport})[0];
						if (airportData){ // airport has strikes of current animal
							mapPoint = project(airportData.geometry.coordinates);
							chartLines.append('line')
								.attr('class', function () { return view.model.id +" line"})
								.attr("x1", function() { return view.getXAnchor() })
								.attr("y1", function() { return view.getYAnchor() })
								.attr("x2", function() { return mapPoint[0]; })
								.attr("y2", function() { return mapPoint[1]; })
								.attr("stroke",lineColor)
								.attr("opacity",1);
								//.transition()
									//.delay(function(d,i) { return count * 150 })
									//.duration(500)
									//.attr("opacity",1);
							count++;
						}
					});
						
				}); // END map.on strikesByAnimal
				
			}); // end JSON load				
				
			WSR.vars.map.on('deselectAnimal',function(ev,view) {
				chartLines.selectAll("."+view.model.id)
					.transition()
						.delay(function(d,i) { return i * 50 })
						.duration(150)
						.attr("opacity",0)
						.remove();
			}); // END map.on deselectAnimal
			
			WSR.vars.map.on('updateLines',function(ev,view) {
				chartLines.selectAll("."+view.model.id)
					.attr("x1", function() { return view.getXAnchor() })
					.attr("y1", function() { return view.getYAnchor() });
			}); // END map.on updateLines
			
		} // END initMap
	} // end return closure
})(jQuery,_,d3);