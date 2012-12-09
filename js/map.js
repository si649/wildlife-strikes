/*
**	Map Module
**		Initializer:		initMap("DOM_REFERENCE");
**		Exposes Events:		'strikesByAnimal'	view,airport list
**							'deselectAnimal'	view
**							'updateLines'		view

** Map just cares about getting a set of airports, from either time or from animals
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
			map.zoomControl.setPosition("topright");
			
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

			   	/////// TESTING UPDATING AIRPORTS - IGNORE ////////
			    var currentAirports = [{"type":"Feature","id":"KDDC","properties":{"name":"Dodge City Regional Airport",
									"address":"100 Airport Road, Dodge City, KS, United States"},"geometry":{"type":"Point","coordinates":[-99.965556,37.763333]}},
									{"type":"Feature","id":"KVQQ","properties":{"name":"Cecil Airport",
									"address":"13365 Aeronautical Circle, Jacksonville, FL, United States"},"geometry":{"type":"Point","coordinates":[-81.880964,30.221704]}},
									{"type":"Feature","id":"6B6","properties":{"name":"Minute Man Air Field",
									"address":"302 Boxboro Road, Stow, MA, United States"},"geometry":{"type":"Point","coordinates":[-71.517166,42.462046]}}];
				///////////////////////////////////////////////////

				var airport = chartNodes.selectAll("path")
				    .data(collection.features)	// will be replaced by currentAirports - a filtered array of objects
				    .enter().append("path")
					    .attr("class", function (d) { return d.id + " leaflet-zoom-hide"})
					    .on("mouseover", function (d, i) { infobox(d, this); })//infobox)
						.on("mouseout", function (d, i) { infoboxRemove(this); })
						.on("click", function (d, i) { infoboxClick(this); }); // What do we want to do with this? *** M Bostock Example http://bl.ocks.org/2086461

				//Constructs the SVG elements for the infobox. Each line of text needs its own element and all of the elements need to be in the same "g" group

				var infoBox = d3.select("body")
								.append("div")
									.attr("id","tooltip")
									.style("position","absolute")
									.style("z-index","10")
									.style("visibility","hidden");

				//https://groups.google.com/forum/?fromgroups=#!topic/d3-js/GgFTf24ltjc
				var mouseOverActive = true;
				//Adds an infobox on a mouseon event
				function infoboxClick (path) {

					d3.select(path).style("fill","black");
					mouseOverActive = false;

				}

				function updateMouseOver() {

					mouseOverActive = true;
				}

				function infobox(d, path) {

					var airportData = d;
		
					//console.log("This is the x: " + mousePos[0] + " This is the y: " + mousePos[1]);
					
					if(mouseOverActive == true) {

						d3.select(path).style("fill","crimson");
						
						//console.log("Mouse Position x: " + mousePos[0] + " Mouse Position y: " + mousePos[1])
						infoBox
							.style("top", (d3.event.pageY) + "px") //+ "px")
							.style("left", (d3.event.pageX + 20) + "px") //+ "px")
							.style("width", 300 + "px")
							.style("height", 100 + "px")
							.style("opacity", .80)
							.style("visibility","visible")
							.html("Airport ID: " + airportData.id + "<br />" + "Airport Name: " + airportData.properties.name + "<br />" + "<a href=\"\" onclick=\"updateMouseOver\">Click Me To Close</a>");
							//<a href=\"http://maps.google.com/?q=" Google Query
					}
				}

				//Removes the info box on a mouseout event
				function infoboxRemove(path) {

					if(mouseOverActive == true) {

						d3.select(path).style("fill","teal"); 
						infoBox.style("visibility","hidden")

					}
				}
			
				map.on("viewreset", reset);
				map.on("drag", updateDrag);
				map.on("zoomend", updateZoom);
				reset();
				
				function updateDrag(ev){
					chartLines.selectAll("line")
						.attr("x1", function(d) { 
							var newPos = map.containerPointToLayerPoint([d.uiView.getXAnchor(),d.uiView.getYAnchor()]);
							return newPos.x; 
						})
						.attr("y1", function(d) { 
							var newPos = map.containerPointToLayerPoint([d.uiView.getXAnchor(),d.uiView.getYAnchor()]);
							return newPos.y; 
						});
				}
				function updateZoom(ev){
					chartLines.selectAll("line")
						.attr("x2", function(d) { 
							var newPos = project(d.mapCoord);
							return newPos[0]
						})
						.attr("y2", function(d) { 
							var newPos = project(d.mapCoord);
							return newPos[1]
						});
					
				}
				
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
			      
				    airport.attr("d", path);
				}
				
				// Placeholder for event handler for updating the array airports in the current time
				WSR.vars.map.on('updateAirports', function(ev,updatedAirports) {
					// filter collection.features by airports in currentAirports
					// make this data available to the airport drawing object
					// Q: will I also need to pass in view?
					// Q: where will collection.features be stored to be made available to this function?
					// Q: where will we store the array of current airports?
				}); // END map.on updateAirports
				
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
							var datm = {"mapCoord":airportData.geometry.coordinates,
										"uiView":view
										}
							chartLines.append('line')
								.datum(datm)
								.attr('class', function () { return view.model.id +" line"})
								.attr("x1", function(d) { 
									newPos = map.containerPointToLayerPoint([d.uiView.getXAnchor(),d.uiView.getYAnchor()]);
									return newPos.x; 
								})
								.attr("y1", function(d) { 
									newPos = map.containerPointToLayerPoint([d.uiView.getXAnchor(),d.uiView.getYAnchor()]);
									return newPos.y; 
								})								
								.attr("x2", function() { return mapPoint[0]; })
								.attr("y2", function() { return mapPoint[1]; })
								.attr("stroke",lineColor)
								.attr("opacity",1)
								.on('click', function(d,i) { console.log(d.getID()) });
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
					.attr("x1", function(d) { 
						newPos = map.containerPointToLayerPoint([d.uiView.getXAnchor(),d.uiView.getYAnchor()]);
						return newPos.x; 
					})
					.attr("y1", function(d) { 
						newPos = map.containerPointToLayerPoint([d.uiView.getXAnchor(),d.uiView.getYAnchor()]);
						return newPos.y; 
					})
			}); // END map.on updateLines
			
		} // END initMap
	} // end return closure
})(jQuery,_,d3);