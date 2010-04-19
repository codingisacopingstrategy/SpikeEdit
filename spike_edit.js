jQuery(function($) {
	
	// We want to focus on the future so we lock out all but the latest browsers
	// Going forward we will make this out baseline browser compatibility level
	function lockOutNonCurrentBrowsers() {
		// Our current target is IE (>= 8), Mozilla (>= 3.6), and Safari (>= 4)
		var browser_version = parseFloat($.browser.version);
		
		if (($.browser.msie && browser_version > 7) ||
		   ($.browser.mozilla && browser_version > parseFloat("1.9.1")) ||
		   ($.browser.webkit && browser_version > 525))
		{
			activateEditableAreas();
		}
		else
		{
			alert("Your browser is too old. You need to upgrade it to use our editing functions.");
		}
	}
	
	function activateEditableAreas() {
		// Loop through all elements with the class .editable and make them editable
		// TODO: We might want to limit these elements to div's only
		$(".editable").each(function() {		
			this.contentEditable = true;
			$(this).addClass("spikeEditable");
			$(this).focus(function() {
				var current_focused_editable = $(this);
			});
			$(this).blur(function() {
				// This will help us debug the code that a browser generates when we do something
				$("#debug").text($(this).html());
			});
		});
		
		createToolbar();
	}
	
	function createToolbar() {
		// Create toolbar buttons
		bold_button = $("<a href='#'>Bold</a>").click(function() {
			spikeExecCommand("bold", false, null);
		});

		// Create the toolbar at the top of the screen
		$("body").append($("<div id='spikeToolbar'></div>"));
		$("#spikeToolbar").append(bold_button)
						  .append(" | ")
						  .append($("<a href='#'>Italic</a>"))
						  .append(" | ")
						  .append($("<a href='#'>Underline</a>"));
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
	
	lockOutNonCurrentBrowsers();

});