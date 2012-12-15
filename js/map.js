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
			
			var layer = new L.StamenTileLayer("toner-background");	// switch to "watercolor" for fun times!
			var map = new L.Map(parent.substr(1, parent.length-1), {
			    center: new L.LatLng(39.810556, -98.556111),
			    minZoom: 3,
			    zoom: 4,
			    attributionControl: false,
			    scrollWheelZoom: false
			});
			map.addLayer(layer);
			map.zoomControl.setPosition("topright");
			$("#map .leaflet-control a").eq(0).after('<a class="leaflet-control-reset" href="#" title="Reset Map"></a>');
			
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

			    var currentAirports = [];

				//Constructs the SVG elements for the infobox. Each line of text needs its own element and all of the elements need to be in the same "g" group

				var infoBox = d3.select("body")
								.append("div")
									.attr("id","tooltip")
									.style("position","absolute")
									.style("z-index","10")
									.style("visibility","hidden");

				//Variable to hold the incident data that is loaded
				var incidentData;

				//*** Mouseclick Event Infobox
			
				function infoboxClick (d, path) {

					//Airport Node Visual Effects
					d3.select(path).classed("redDotClicked", true);
					d3.select(path).classed("redDotTransition", true);

					//Load Airport Data From d3.select(path) Function
					var airportData = d;

					//Create Object To Store Filtered Data
					var templateData = {};
					var strikesCount = 0;

					//Creates property items annd makes it an array
					templateData.items = [];
					templateData.airport = airportData.properties.name;
					var remarkClass = "remark";
					
					//Create the time display for the Lightbox

					months = WSR.vars.date;
					
					var firstMonth = months[0].split('_');
					
					var monthDisplay = firstMonth[1] + '/' + firstMonth[0];
					
					templateData.between = monthDisplay;

					if (months.length > 1) {
						
						var lastMonth = months[months.length - 1].split('_');
					 	monthDisplay += ' - ' + lastMonth[1] + '/' + lastMonth[0];
						templateData.between = monthDisplay;

					 }

					//Uses the JSON file from infobox function and iterates over it
					$.each(incidentData, function(i){
						$.each(incidentData[i], function(j){

							if(incidentData[i][j].AIRPORT_ID == airportData.id) { //Compares all of the incidents in the file to the current airport and returns values that match

									strikesCount++;
									var incidentRemarks = incidentData[i][j].REMARKS;
									
									if(incidentRemarks == "") {

										incidentRemarks = "No Remark For This Incident";
										remarkClass = "noRemark";
										console.log("why am I getting weird quotes... " + templateData.remarkClass)

									} else {

										incidentRemarks = "\"" + incidentRemarks + "\"";
									}

									if(strikesCount == 1){
										
										templateData.strikes = "Total Strike " + strikesCount;
									
									} else {
										
										templateData.strikes = "Total Strikes " + strikesCount;
									}
								
									templateData.items.push({ SPECIES : incidentData[i][j].SPECIES, REMARKS: incidentRemarks, DATE: incidentData[i][j].INCIDENT_DATE, REMARKCLASS: remarkClass});
									console.log(templateData);
							}
						});
					});
					
					//Grab the Template and Compile
					$.get("templates/nodeDetails.html", function(nodeTemplate) {

						template = Handlebars.compile(nodeTemplate)

						//Set the Context Data
						var context = templateData;
				
						var infoboxContents = d3.select("body")
						 					.append("div")
					 							.attr("id","infoboxContents");
											
						//Lightbox call to nodeDetails Template
						lightbox($("#infoboxContents").html(template(context)));
					
					}); // End of the $.get("templates/nodeDetails") call
				} //End of the infoClick Function


				//*** Mouseover Event Infobox
		
				function infobox(d, path) {

					var airportData = d;
					
					d3.select(path).classed("redDotMouse", true);
					d3.select(path).classed("redDotTransition", false);
					
					var strikesCount = 0;
					
					//Grab the global variable
					incidentData = WSR.vars.incidents; 

					$.each(incidentData, function(i){
						$.each(incidentData[i], function(j){

							if(incidentData[i][j].AIRPORT_ID == airportData.id){

								strikesCount++;
							
							}
						});
					});
		
					infoBox
							.style("top", (d3.event.pageY) + "px")
							.style("left", (d3.event.pageX + 20) + "px")
							.style("width", airportData.properties.name.length * 10)
							.style("visibility","visible")
							.html("<p>" + airportData.properties.name + "</p>" + "Airport ID: " + airportData.id  + "<br />" + "Strike Count: " + strikesCount);
						
				}
				
				//*** Mouseout Event Infobox
				
				function infoboxRemove(path) {

					d3.select(path).classed("redDotMouse", false);
					infoBox.style("visibility","hidden");

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
					// filter collection.features by airports in updatedAirports
					// and store this filtered set of airports in currentAirports for use by D3
					currentAirports = _.filter(collection.features, function(airport){
						return _.contains(updatedAirports, airport.id);
					});

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
				// get number of lines being drawn
				var lineCount = chartLines.selectAll("."+view.model.id);

				// if number of connected airports is small, remove lines with slowish transition
				if (lineCount[0].length < 50) {
					lineCount.transition()
						.delay(function(d,i) { return i * 25; })
						.duration(25)
						.attr("opacity",0)
						.remove();
				} else {
					lineCount.transition()
						.delay(function(d,i) { return i * 1.05; })
						.attr("opacity",0)
						.remove();
				}

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
			WSR.vars.map.on('clearLines',function(ev) {
				chartLines.selectAll("line").remove();
				$("#animals li").removeClass('active');
			});
			
			
			// experimenting with a reset button for the map
			$(".leaflet-control-reset").on("click", function(ev) {
				map.setView([39.810556, -98.556111],4);
			});

		} // END initMap
	} // end return closure
})(jQuery,_,d3);