/*
**	Animal UI Module
**		Initializer:		initAnimalUI("DOM_REFERENCE");
**		Exposes Events:		None
*/

window.WSR = window.WSR || {};
$.extend(true,WSR,{
	vars: {},
	models: {},	// store data models for reference
	views: {}	// store UI views for reference
});	

var AnimalUI = (function($,_,d3){
	return function(){
	// Create Animal Model
		WSR.models.Animal = function(data){
			this.id = data.id;
			this.name = data.name;
			this.strikes = data.strikes; // object with airport arrays by time increment
		} //end Animal Constructor
		WSR.models.Animal.prototype.getStrikes = function(view,callback) {
			return callback ? callback.call(view, this.strikes) : this.strikes;
		} // END getStrikes
		
		// Create Family Model
		WSR.models.Family = function(data){
			this.id = data.id;
			this.name = data.name;
			this.animals = [] // a list of WSR.models.Animal objects
		} // END Family Constructor
		
		// cycle through the animals array and return back just the strike data
		WSR.models.Family.prototype.extractAnimalStrikes = function(){
			return _.map(this.animals, function(animal){ return animal.getStrikes()});
		} // END extractAnimalStrikes
		 
		// match the getStrikes signature across models for some polymorphic action
		// with the family model, we also do the data check to see if we need to request the json file
		WSR.models.Family.prototype.getStrikes = function(view,callback) {
			if(this.animals.length < 1){
				this.fetchAnimalData(view,callback ? callback : null);
			}else {
				callback ? callback.call(view,this.extractAnimalStrikes()) : this.extractAnimalStrikes();
			}
		
		} // END getStrikes
		
		// retrieve the family's json file, and execute a callback function if passed
		// using the callback here lets us call getStrikes() without having to worry if async data is already loaded
		WSR.models.Family.prototype.fetchAnimalData = function(view,callback) {
			var dataUrl = "data/families/family"+this.id+".json";
			var family = this;
			view.el.append('<div class="spinner">');
			$.ajax({
				url:dataUrl,
				dataType:"json",
				success: function(data){
					var animals = _.groupBy(data,"SPECIES_ID");
					_.each(animals, function(animal,key){
						var strikes = {};
						// sorts the strike records by year
						// should offload more of this work directly into the JSON ?
						_.each(animal, function(strike){ 
							if(_.isUndefined(strikes[strike.INCIDENT_YEAR])){
								strikes[strike.INCIDENT_YEAR] = [strike.AIRPORT_ID];
							} else { 
								strikes[strike.INCIDENT_YEAR].push(strike.AIRPORT_ID);
							}
						});
						// push each animal to the Family Model's animals array
						model = {"id":key,"name":animal[0].SPECIES,"strikes":strikes};
						family.animals.push(new WSR.models.Animal(model));
						view.el.find('.spinner').remove();
					});
					// run the callback function in the context of the original view
					if(callback) callback.call(view);
				},
				error: function(jqXHR, textStatus, errorThrown){
					console.log(textStatus, errorThrown);
				}
			});
		} // END fetchAnimalData
		
		// Create a parent class for the two button types
		WSR.views.SpeciesButton = function(model,parent){
			this.parent = parent ? parent : "body";
			this.model = model;
			this.template = '<li><p></p></li>';	
		}
		// a render function that takes care of DOM Injection, and setting up shared listeners
		WSR.views.SpeciesButton.prototype.render = function() {
			this.el = $(this.template).appendTo(this.parent);
			this.el.children("p").on('click',{src:this},function(ev) {
				if ($(this).parent().hasClass('active')){
					$(this).parent().removeClass('active');
					WSR.vars.map.trigger('deselectAnimal',[ev.data.src]);
				} else {
					$(this).parent().addClass('active');
					ev.data.src.model.getStrikes(ev.data.src,ev.data.src.drawStrikeLines);
				}
			});
			
			// adds a listener to the window with the view's context for updating lines when the user scrolls
			$(window).scroll({src:this}, function (ev) { 
				if(ev.data.src.el.hasClass('active')){
					// trigger the map's implementation of line redraw, pass view reference for X/Y positions
					WSR.vars.map.trigger('updateLines',[ev.data.src]);
				}
			});
		} // END SpeciesButton Constructor
		
		WSR.views.SpeciesButton.prototype.getID = function(){
			return this.model.id;
		} // END getYAnchor
		
		// calculate all the airports the current view connects to under the current date 
		WSR.views.SpeciesButton.prototype.drawStrikeLines = function(){
			var strikes = this.model.strikes? this.model.strikes : this.model.extractAnimalStrikes();
			// depending on if the model is a Family or an Animal, make sure strikes is an Array of Objects
			if(!$.isArray(strikes)) strikes = [strikes];
			// extract just a list of the airport codes
			var airports = _.chain(strikes).pluck(WSR.vars.date()).flatten().uniq().without(undefined).value();
			// trigger the map's implementation of line drawing, passing view and airport list
			WSR.vars.map.trigger('strikesByAnimal',[this,airports]);
		} // END drawStrikeLines
		
		WSR.views.SpeciesButton.prototype.getXAnchor = function(){ 
			return this.el.children("p").first().offset().left + this.el.children("p").first().outerWidth() - $(window).scrollLeft();
		} // END getXAnchor
		WSR.views.SpeciesButton.prototype.getYAnchor = function(){
			return this.el.children("p").first().offset().top + this.el.children("p").first().outerHeight()/2 - $(window).scrollTop();
		} // END getYAnchor
		
		// Child class for animal buttons
		WSR.views.AnimalButton = function(model,parent){
			WSR.views.SpeciesButton.call(this,model,parent);
			this.template = '<li class="animal"><p>'+this.model.name+'<span>><a class="photo"></a></span></p></li>';
			this.render();
			
			// grab animal's photo on "eye" hover, NOTE: should had a delay for unintentional rollover
			this.el.find('span').on('mouseover', {src:this}, function(ev){
				var target = this;
				// this is using the regular name right now, getting the scientific name in would be much better
				var text = ev.data.src.model.name
				var key = "33e34c279602f7ce0b89978eccc93bb5" // 3600 calls an hr
				
				var baseUrl = "http://api.flickr.com/services/rest/?"
				var attrs = [
					"method=flickr.photos.search",
					"api_key="+key,
					"text="+text.replace(" ","+"),
					"tags="+"wildlife",
					"per_page=1",
					"page=1",
					"format=json",
					"nojsoncallback=1"
				]
				var req = baseUrl + attrs.join("&");
				$.getJSON(req,function(data){
					// http://www.flickr.com/services/api/misc.urls.html
					console.log('test');
					var photo = data.photos.photo[0] // only asked for 1 photo
					var size = "s"	// 75x75 square  
					var url = "http://farm"
						+photo.farm
						+".static.flickr.com/"
						+photo.server+"/"
						+photo.id+"_"+photo.secret+"_"+size+".jpg";
						
					var html = "<img src='"+url+"'/>";
					$(target).find('.photo').html(html);
				});
			});
			
		} // END AnimalButton Constructor
		WSR.views.AnimalButton.prototype = new WSR.views.SpeciesButton;
		
		// Child class for family buttons
		WSR.views.FamilyButton = function(model,parent){
			WSR.views.SpeciesButton.call(this,model,parent);
			this.template = '<li class="family"><p>'+this.model.name+'<span>&#x25BC;</span></p></li>';
			this.animalButtons = [] // array of AnimalButtons under this FamilyButton
			this.render();
			
			
			// FamilyButton specific event listener/handler for toggling sub-animal views
			this.el.find("span").on('click',{src:this}, function(ev){
				ev.preventDefault();
				ev.stopPropagation();
				if($(this).hasClass('open')){
					$(this).removeClass('open').html("&#x25BC;");
					$("html,body").animate({scrollTop:$(window).scrollTop()+10},550); //force trigger window update
					$(this).parent().siblings("ul").slideUp('250');
					
					// deselect any child elements,and let the map know
					_.each(ev.data.src.animalButtons, function(view) {
						if(view.el.hasClass('active')){
							view.el.removeClass('active');
							WSR.vars.map.trigger('deselectAnimal',[view]);
						}
					});
				} else {
					$(this).addClass('open').html("&#x25BA;");
					if($(this).parent().siblings("ul")[0]){ // check to see if animalButtons have been created
						$("html,body").animate({scrollTop:$(window).scrollTop()+10},350); //force trigger window update
						$(this).parent().siblings("ul").slideDown('250');
						
					} else {
						// create the child animal buttons
						ev.data.src.model.getStrikes(ev.data.src,ev.data.src.createAnimalButtons);
					}
				}
				
				
			});
		} // END FamilyButton Constructor
		WSR.views.FamilyButton.prototype = new WSR.views.SpeciesButton;
		
		WSR.views.FamilyButton.prototype.createAnimalButtons = function() {
			var animals = _.uniq(this.model.animals);
			var parentView = this;
			var parent = $('<ul class="animals">').appendTo(parentView.el);	
			_.each(animals, function(animal){
				parentView.animalButtons.push(new WSR.views.AnimalButton(new WSR.models.Animal(animal),parent));
			});
			$("html,body").animate({scrollTop:$(window).scrollTop()+10},350); //force trigger window update
			parent.slideDown('250');
			
		} // END createAnimalButtons
		
		// setup function for the "module", retrieves family json and sets up the top level buttons
		this.initAnimalUI = function(parent) {
			$.ajax({
				url:"data/animals.json",
				dataType:"json",
				success: function(data){
					WSR.vars.familyButtons = [];
					_.each(data, function(fam) { 
						// save reference for debugging
						WSR.vars.familyButtons.push(new WSR.views.FamilyButton(new WSR.models.Family(fam),parent));
					});
				},
				error: function(jqXHR, textStatus, errorThrown){
					console.log(textStatus, errorThrown)
			}})
		} // END initAnimalUI()
	} // end return closure
})(jQuery,_,d3);



