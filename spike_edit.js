jQuery(function($) {
	
	// Loop through all elements with the class .editable and make them editable
	// TODO: We might want to limit these elements to div's only
	$(".editable").each(function() {
		this.contentEditable = true;
		$(this).addClass("spikeEditable");
		$(this).focus(function() {
			
		});
		$(this).blur(function() {
			// This will help us debug the code that a browser generates when we do something
			$("#debug").text($(this).html());
		});
	});
	
	// Create toolbar buttons
	bold_button = $("<a href='#'>Bold</a>").click(function() {
		document.execCommand("bold");
	});

	// Create the toolbar at the top of the screen
	$("body").append($("<div id='spikeToolbar'></div>"));
	$("#spikeToolbar").append(bold_button)
					  .append(" | ")
					  .append($("<a href='#'>Italic</a>"))
					  .append(" | ")
					  .append($("<a href='#'>Underline</a>"));

});