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

			//InfoBox Variables

			var nodeClicked = false;

			// Use Leaflet to implement a D3 geographic projection.
			function project(x) {
				var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
				return [point.x, point.y];
			}
			
			d3.json("data/airports.json", function(collection) {
				var bounds = d3.geo.bounds(collection),
			    	path = d3.geo.path().projection(project);

			    path.pointRadius(5);

			    var currentAirports = collection.features;

				//Constructs the SVG elements for the infobox. Each line of text needs its own element and all of the elements need to be in the same "g" group

				var infoBox = d3.select("body")
								.append("div")
									.attr("id","tooltip")
									.style("position","absolute")
									.style("z-index","10")
									.style("visibility","hidden");

				//https://groups.google.com/forum/?fromgroups=#!topic/d3-js/GgFTf24ltjc
				
				//Adds an infobox on a mouseon event
				function infoboxClick (d, path) {

					nodeClicked = true;

					d3.select(path).style("fill","crimson");

					// Light Box Code From: http://kyleschaeffer.com/development/lightbox-jquery-css/

					var airportData = d;


					//Grab JSON File and then Iterate Over It
					$.getJSON("./Data/incidents/1999_10_incidents.json",function(data) {

//********************
//
// Begin Iterating Over Incidents
//
//********************  							
/*
  							$.each(data,function(i) {

  								if(data[i].INDEX_NR == //what variable do I compare to? I need a primary key to function on)
								console.log("this is...." + data[i].STATE);

							})
*/
//********************
//
// End Iterating Over Incidents
//
//********************

						//Grab the Template and Compile
						$.get("templates/nodeDetails.html", function(nodeTemplate) {

							template = Handlebars.compile(nodeTemplate)

							//Test Data For The Template
							var context = { SPECIES: "My First Blog Post!", REMARKS: "Remarks go here"};
							// var context = {

							// 					items: [

							// 								{
							// 									SPECIES: "My First Blog Post!",
							// 									REMARKS: "Remarks go here"
							// 								},

							// 								{
							// 									SPECIES: "My Second Blog Post!",
							// 									REMARKS: "Remarks go here"
							// 								},

							// 								{
							// 									SPECIES: "My Third Blog Post!",
							// 									REMARKS: "Remarks go here"
							// 								}
							// 							]
							// };

//***********************************
//
// Start: Old Working infoboxContents
//
//***********************************
/*
							var infoboxContents = d3.select("body")
							 					.append("div")
						 							.attr("id","infoboxContents")
													.html(	"Airport ID: " + airportData.id + "<br />" + 

															"Airport Name: " + airportData.properties.name  + "<br />" + 

															"<a href=\"http://maps.google.com/?q=" + airportData.properties.name + "\">Google Map</a>" + "<br />" + 

															"Incident State: " + data[1]["STATE"] + "<br />"

														 );
*/
//***********************************
//
// End: Old Working infoboxContents
//
//***********************************
							var infoboxContents = d3.select("body")
							 					.append("div")
						 							.attr("id","infoboxContents");
													//.html(template(context));
							//Diagnostics
							console.log("This is the template: " + template)
							console.log("This is the context: " + context)
							console.log("This is the infoboxContents: " + infoboxContents)
							
							//Old Working Lightbox
								//lightbox($("#infoboxContents").html());
							lightbox($("#infoboxContents").html(template(context)));
						
						}); // End of the $.get("templates/nodeDetails") call
					}); //End of the $.getJSON incidents call
				} //End of the infoClick Function

				function infobox(d, path) {

					var airportData = d;
					
					d3.select(path).style("fill","crimson");
					
					//console.log("Mouse Position x: " + mousePos[0] + " Mouse Position y: " + mousePos[1])
					infoBox
						.style("top", (d3.event.pageY) + "px") //+ "px")
						.style("left", (d3.event.pageX + 20) + "px") //+ "px")
						.style("width", 300 + "px")
						.style("height", 60 + "px")
						.style("opacity", .80)
						.style("visibility","visible")
						.html("Airport ID: " + airportData.id + "<br />" + "Airport Name: " + airportData.properties.name);
						//<br />" + "<a href=\"http://maps.google.com/?q=" + airportData.id + "\">Google Map</a>" + "<br />" + "<a href=\"\" onclick=\"updateMouseOver\">Click Me To Close</a>"
						//<a href=\"http://maps.google.com/?q=" Google Query
	
				}

				//Removes the info box on a mouseout event
				function infoboxRemove(path) {

					console.log("Node Clicked Status: " + nodeClicked)
					if(nodeClicked == false) {
	
						d3.select(path)
							.style("fill","teal")
							.style("transition-property","fill")
							.style("transition-duration","4s");


						infoBox.style("visibility","hidden");

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
					// set up outer bounds of graph
			      	var bottomLeft = project(bounds[0]),
			          	topRight = project(bounds[1]);
			  
			      	svg.attr("width", topRight[0] - bottomLeft[0])
			          	.attr("height", bottomLeft[1] - topRight[1])
			          	.style("margin-left", bottomLeft[0] + "px")
			          	.style("margin-top", topRight[1] + "px");

			      	// create airport nodes based on data in currentAirports
			      	var airport = chartNodes.selectAll("path")
				    	.data(currentAirports);
				 
				 	// draw new airport nodes
					airport.enter().append("path")
					    .attr("class", function (d) { return d.id + " leaflet-zoom-hide"})
					    .on("mouseover", function (d, i) { infobox(d, this); })//infobox)
						.on("mouseout", function (d, i) { infoboxRemove(this); })
						.on("click", function (d, i) { infoboxClick(d, this); }); // What do we want to do with this? *** M Bostock Example http://bl.ocks.org/2086461

					// remove airport nodes not in current data
					airport.exit().remove();
			  
			  		// 
			      	chartNodes.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      	chartLines.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
			      	infoBox.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

				  	airport.attr("d", path);
				}
				
				// Event handler for updating the airports based on the current time window
				WSR.vars.map.on('updateAirports', function(ev,updatedAirports) {
					console.log('updated: ' + updatedAirports);
					// filter collection.features by airports in updatedAirports
					// and store this filtered set of airports in currentAirports for use by D3
					currentAirports = _.filter(collection.features, function(airport){
						return _.contains(updatedAirports, airport.id);
					});
					console.log('current: ' + currentAirports);

					reset();
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