jQuery(function($) {
		
	function activateEditableAreas() {
		// Loop through all elements with the class .editable and make them editable
		// TODO: We might want to limit these elements to div's only
		$(".editable").each(function() {		
			var editable_area = $(this);
			
			this.contentEditable = true;
			$(this).addClass("spikeEditable");
			$(this).focus(function() {
				current_focused_editable = $(this);
			});
			$(this).blur(function() {
				// This will help us debug the code that a browser generates when we do something
				$("#debug").text($(this).html());
			});
			
			// Set all descendant nodes to report their properties
			// to the propery inspector when clicked on
			$("*", $(this)).each(function() {
				$(this).click(function() {
					// Keep track of this elements for the events below
					var clicked_element = $(this);
					// Just concentrating on images for now
					if ($(this).attr("src"))
					{
						var image = $(this);
						var image_ratio = image.width() / image.height();
						// Updates the property inspector with inputs for this element
						$("#spikePropertyInspector").html(
							"Source: <input name='src' value='" + $(this).attr("src") + "'>" + "<br>" +
							"Width: <input name='width' value='" + $(this).width() + "'>" + " " +
							"Height: <input name='height' value='" + $(this).height() + "'>" + "<br>" + 
							"Resize: <div id='resize' style='width: 400px;'></div>"
						);
						$("#resize").slider({ max: editable_area.width(), min: 1, 
											  value: $(this).width(),
						 					  slide: function(event, ui) { 
												image.width(ui.value);
												image.height(ui.value / image_ratio);
												} 
											  });
						// Sets a change event for each input that will update the relevant attribute
						// on the clicked upon element
						$("*", $("#spikePropertyInspector")).each(function() {
							$(this).change(function() {
								clicked_element.attr($(this).attr("name"), $(this).val());
							});
						});
					}
				});
			});
			// Set all images to be resizable
			// TODO: This code works ok in safari, but it creates too much mess, look for alternatives
			// $("img", $(this)).each(function() {
			// 	$(this).resizable({ handles: 'all', aspectRatio: true });
			// });
		});
		
		if (!$.browser.msie) { document.execCommand("styleWithCSS", false, false); }
	}
	
	function createToolbar() {
		// Create toolbar buttons
		bold_button = $("<a href='#'>Bold</a>").click(function() {
			spikeExecCommand("bold", false, null);
		});

		italic_button = $("<a href='#'>Italic</a>").click(function() {
			spikeExecCommand("italic", false, null);
		});

		underline_button = $("<a href='#'>Underline</a>").click(function() {
			spikeExecCommand("underline", false, null);
		});

		// Create the toolbar at the top of the screen
		$("body").append($("<div id='spikeToolbar'></div>"));
		$("#spikeToolbar").append(bold_button)
						  .append(" | ")
						  .append(italic_button)
						  .append(" | ")
						  .append(underline_button);
	}
	
	function createPropertyInspector() {
		// Create the property inspector at the bottom of the screen
		$("body").append($("<div id='spikePropertyInspector'></div>"));
	}
	
	// A function to clean up HTML generated
	function cleanHTMLOutput() {
		$(".editable").each(function() {
			// convert bold tags to strong tags
			$(this).contents().find("b").each(function() {
				$(this).replaceWith("<strong>" + $(this).html() + "</strong>");
			});
		});
	}
	
	// A function to make execCommand cross-browser identical
	function spikeExecCommand(commandName, showDefaultUI, valueArgument) {
		document.execCommand(commandName, showDefaultUI, valueArgument);
		// Mozilla needs to be refocused on the current editable area
		if ($.browser.mozilla) { current_focused_editable.focus(); }
	}
	
	activateEditableAreas();
	createToolbar();
	createPropertyInspector();
	
});