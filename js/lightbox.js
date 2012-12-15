/****************************************
	Barebones Lightbox Template
	by Kyle Schaeffer
	kyleschaeffer.com
	* requires jQuery

	Modified By: Phillip Tularak, Nikki Roda, Jeremy Salfen, Paul Ellebrecht, and Wesley Lauka for FAA Airstrikes Visualization SI649: Information Visualization www.si.umich.edu
****************************************/
// display the lightbox
function lightbox(insertContent, ajaxContentUrl){

	// add lightbox/shadow <div/>'s if not previously added
	if($('#lightbox').size() == 0){
		var theLightbox = $('<div id="lightbox"/>');
		var theShadow = $('<div id="lightbox-shadow"/>');
		$(theShadow).click(function(e){

			closeLightbox();
		});
		//sticky rest of the page
		
		
		$('body').append(theShadow);
		$('body').append(theLightbox);
	}

	// remove any previously added content
	$('#lightbox').empty();

	// insert HTML content
	if(insertContent != null){
		$('#lightbox').append(insertContent);
	}

	// insert AJAX content
	if(ajaxContentUrl != null){
		// temporarily add a "Loading..." message in the lightbox
		$('#lightbox').append('<p class="loading">Loading...</p>');

		// request AJAX content
		$.ajax({
			type: 'GET',
			url: ajaxContentUrl,
			success:function(data){
				// remove "Loading..." message and append AJAX content
				$('#lightbox').empty();
				$('#lightbox').append(data);
			},
			error:function(){
				alert('AJAX Failure!');
			}
		});
	}

	// move the lightbox to the current window top + 100px
	$('#lightbox').css('top', $(window).scrollTop() + 100 + 'px');

	// display the lightbox
	$('#animals').addClass("freeze");
	$('#lightbox').show();
	$('#lightbox-shadow').show();

}

// close the lightbox
function closeLightbox(){
	
	//CSS Fade Effect
	d3.select(".redDotClicked").classed("redDotClicked", false)
		
	// hide lightbox and shadow <div/>'s
	$('#lightbox').hide();
	$('#lightbox-shadow').hide();
	// un-sticky rest of the page
	$('#animals').removeClass("freeze");

	// remove contents of lightbox in case a video or other content is actively playing
	$('#lightbox').empty();

}
