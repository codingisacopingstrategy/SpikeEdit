jQuery(function($) {
	$(".editable").each(function() {
		this.contentEditable = true;
		$(this).addClass("spikeEditable");
		$(this).focus(function() {
			
		});
		$(this).blur(function() {
			
		});
	});
});