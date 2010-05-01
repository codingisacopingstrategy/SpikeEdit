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
				$("#debug").text($.htmlClean($(this).html(), { format: true }));
			});
			
			// Convert HTML for browser compatibility
			formatFor(editable_area);
			
			// Set all descendant nodes to report their properties
			// to the propery inspector when clicked on
			$("*", $(this)).each(function() {
				$(this).click(function() {
					// Keep track of this elements for the events below
					var clicked_element = $(this);					
					
					// Just concentrating on images for now
					if (clicked_element.attr("src"))
					{
						var image = $(this);
						var image_ratio = image.width() / image.height();
						// Updates the property inspector with inputs for this element
						$("#spikePropertyInspector").html(
							"Source: <input name='src' value='" + image.attr("src") + "'>" + "<br>" +
							"Width: <input name='width' value='" + image.width() + "'>" + " " +
							"Height: <input name='height' value='" + image.height() + "'>" + "<br>" + 
							"Resize: <div id='resize' style='width: 400px;'></div>"
						);
						// Create the resizable slider. The maximum width is the width of the content area
						$("#resize").slider({ max: editable_area.width(), min: 1, 
											  value: image.width(),
						 					  slide: function(event, ui) { 
												image.width(ui.value);
												image.height(ui.value / image_ratio);
												refreshPropertyInspector(image);
												} 
											  });
												
						// Sets a change event for each input that will update the relevant attribute
						// on the clicked upon element
						$("input", $("#spikePropertyInspector")).each(function() {
							$(this).change(function() {
								if ($(this).attr("name") == 'width')
								{ 
									clicked_element.animate({ width: $(this).val(), 
															  height: $(this).val() / image_ratio },
															  { complete: function() { refreshPropertyInspector(image); }
															});
								}
								else if ($(this).attr("name") == 'height')
								{
									clicked_element.animate({ height: $(this).val(), 
															  width: $(this).val() * image_ratio },
															  { complete: function() { refreshPropertyInspector(image); }
															});
								}
								else if ($(this).attr("name") == 'src')
								{									
									$("<img>")
										.attr("src", $(this).val())
										.load(function() {
											clicked_element.attr("src", $(this).attr("src"));
											clicked_element.width($(this).attr("width"));
											clicked_element.height($(this).attr("height"));
										});
								}
								else
								{
									clicked_element.attr($(this).attr("name"), $(this).val());
								}
							});
						});
					}
				});
				
				// What to do when the element loses selection
				$(this).focus(function() {
					$(this).css("outline", "dotted 1px #6FAEE4");
				});
				
				// What to do when the element loses selection
				$(this).blur(function() {
					$(this).css("outline", "none");
				});
			});
			// Set all images to be resizable
			// TODO: This code works ok in safari, but it creates too much mess, look for alternatives
			// $("img", $(this)).each(function() {
			// 	$(this).resizable({ handles: 'all', aspectRatio: true });
			// });
		});
		
		if (!$.browser.msie) { document.execCommand("styleWithCSS", false, false); }
		
		// This can be used to disable the resizing of images in Firefox
		// document.execCommand("enableObjectResizing", false, false);
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
	
	function refreshPropertyInspector(element) {
		// Update the property inspector when the image changes
		$("input", $("#spikePropertyInspector")).each(function() {
			$(this).val(element.attr($(this).attr("name")));
		});
		$("#resize").slider("value", element.width());
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
	
	function formatFor(editable_area) {
		if ($.browser.webkit)
		{ formatForWebkit(editable_area); }
	}
	
	function formatForWebkit(editable_area) {
		// Webkit prefers bold tags to strong tags
		editable_area.contents().find("strong").each(function() {
			$(this).replaceWith("<b>" + $(this).html() + "</b>");
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