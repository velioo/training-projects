$(document).ready(function() {
	
	//infoLog += '\nfilter_tag.js loaded\n';
	
	$('.checkbox_tag').on('change', function() {
		//infoLog += '\nfilter_tag.js/.checkbox_tag: Executing... \n';
		//infoLog += 'Submitting search form\n';
		//logger.info(infoLog);
		//infoLog = "";	
		$('#filter_form').submit();
	});
	
	if ($('.checkbox_tag:checked').length > 0) {
		$('#filter_form').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a>');
		$('#clear_filters').on('click', function() {
			//infoLog += '\nfilter_tag.js/#clear_filters: Executing... \n';
			//infoLog += 'Submitting search form\n';
			//logger.info(infoLog);
			//infoLog = "";	
			$('.checkbox_tag:checked').removeAttr('checked');
			$('#filter_form').submit();
		});
	}
	
	$('#sort_products').on('change', function() {
		//infoLog += '\nfilter_tag.js/#sort_products: Executing... \n';
		//infoLog += 'Submitting search form\n';
		//logger.info(infoLog);
		//infoLog = "";	
		$('#filter_form').submit();
	});
	
	
});

