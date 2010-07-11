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
				
			});
			$(this).keypress(function(event) {
				if (event.which == 13)
				{
					if ($.browser.mozilla)
					{
						// TODO: prevent mozilla making <br> and replace these with paragraph tags or similar
						// event.preventDefault();
					}
				}
			});
			// Convert HTML for browser compatibility
			formatFor(editable_area);
			fixDeprecatedCode(editable_area);
			
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
												image.attr("width", ui.value);
												image.height(ui.value / image_ratio);
												image.attr("height", ui.value / image_ratio);
												refreshPropertyInspector(image);
												} 
											  });
												
						// Sets a change event for each input that will update the relevant attribute
						// on the clicked upon element
						$("input", $("#spikePropertyInspector")).each(function() {
							$(this).change(function() {
								var new_value = $(this).val();
								if ($(this).attr("name") == 'width')
								{ 
									clicked_element.animate({ width: new_value, 
															  height: new_value / image_ratio },
															  { complete: function() 
																{ 
																	clicked_element.attr("width", new_value);
																	clicked_element.attr("height", new_value / image_ratio);
																	refreshPropertyInspector(image); 
																}
															});
								}
								else if ($(this).attr("name") == 'height')
								{
									clicked_element.animate({ height: new_value, 
															  width: new_value * image_ratio },
															  { complete: function() 
																{ 
																	clicked_element.attr("height", new_value);
																	clicked_element.attr("width", new_value / image_ratio);
																	refreshPropertyInspector(image); 
																}
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
											clicked_element.attr("width", $(this).attr("width"));
											clicked_element.attr("height", $(this).attr("height"));
											image_ratio = clicked_element.width() / clicked_element.height();
											refreshPropertyInspector(clicked_element);
										});
								}
								else
								{
									clicked_element.attr($(this).attr("name"), $(this).val());
								}
							});
							
							$(this).focus(function() {
								// Select the contents of the input automatically
								$(this).select();
							});
							
							$(this).mouseup(function(event){
								// In safari this stops it deselecting the text again
								event.preventDefault();
							});
						});
					}
				});
				
				// What to do when the element gains selection
				// TODO: This could be replaced with jQuery's selection regime
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
		bold_button = $("<a href='#'>Bold</a>").click(function(event) {
			spikeExecCommand("bold", false, null);
			event.preventDefault();
		});

		italic_button = $("<a href='#'>Italic</a>").click(function(event) {
			spikeExecCommand("italic", false, null);
			event.preventDefault();
		});

		underline_button = $("<a href='#'>Underline</a>").click(function(event) {
			spikeExecCommand("underline", false, null);
			event.preventDefault();
		});

		// The view source button loads codemirror in a lightbox (fancybox)
		view_source_button = $("<a href='#'>View Source</a>").click(function(event) {
			// If we've got an editable area in focus
			if (typeof current_focused_editable != 'undefined')
			{
				// Standardise the code
				formatStandard(current_focused_editable);
				
				// Initialize fancybox
				$.fancybox(
					// Codemirror wants a textarea with the HTML in it
					// Heights and widths are set manually and scrolling turned 
					// off in fancybox to avoid problems
					"<textarea rows='1' cols='1' id='editor'>" + 
					current_focused_editable.html() + 
					"</textarea>",
					{
					'hideOnContentClick': false, 
					'hideOnOverlayClick': false, 
					'autoDimensions': false, 
					'width': 800, 
					'height': 500, 
					'centerOnScroll': true, 
					'scrolling': 'no', 
					'onComplete': function() {
						// Codemirror initialises here
						editor = CodeMirror.fromTextArea("editor", {
						  'parserfile': ["parsexml.js", 
									   "parsecss.js", 
									   "tokenizejavascript.js", 
									   "parsejavascript.js", 
									   "parsehtmlmixed.js"],
						  'path': "../code_mirror/js/",
						  'stylesheet': ["../code_mirror/css/xmlcolors.css", 
									   "../code_mirror/css/jscolors.css", 
									   "../code_mirror/css/csscolors.css"],
						  'tabMode': "shift",
						  'reindentOnLoad': true,
						  'width': "800px",
						  'height': "500px"
						});
					},
					'onCleanup': function() {
						// Take the changed code and apply it to the editable area after cleaning it
						current_focused_editable.html(editor.getCode());
						formatFor(current_focused_editable);
						$("#editor").remove();
					}
				});
			}
			event.preventDefault();
		});

		// Create the toolbar at the top of the screen
		$("body").append($("<div id='spikeToolbar'></div>"));
		$("#spikeToolbar").append(bold_button)
						  .append(" | ")
						  .append(italic_button)
						  .append(" | ")
						  .append(underline_button)
						  .append(" | ")
						  .append(view_source_button);
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
	function fixDeprecatedCode(editable_area) {
		$("img[align]", editable_area).each(function() {
			$(this).css("float", $(this).attr("align"));
			$(this).removeAttr("align");
		});
		$("img[hspace]", editable_area).each(function() {
			$(this).css("margin-left", $(this).attr("hspace"));
			$(this).css("margin-right", $(this).attr("hspace"));
			$(this).removeAttr("hspace");
		});
		$("img[vspace]", editable_area).each(function() {
			$(this).css("margin-top", $(this).attr("vspace"));
			$(this).css("margin-bottom", $(this).attr("vspace"));
			$(this).removeAttr("vspace");
		});
	}
	
	function formatFor(editable_area) {
		if ($.browser.webkit)
		{ formatForWebkit(editable_area); }		
	}
	
	function formatForWebkit(editable_area) {
		// Webkit prefers bold tags to strong tags
		$("strong", editable_area).each(function() {
			$(this).replaceWith("<b>" + $(this).html() + "</b>");
		});
	}
	
	function formatStandard(editable_area) {
		// We prefer bold tags to be strong tags
		$("b", editable_area).each(function() {
			$(this).replaceWith("<strong>" + $(this).html() + "</strong>");
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