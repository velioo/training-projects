$(document).ready(function() {

	$('.checkbox_tag').on('change', function() {
		$('#filter_form').submit();
	});
	
	if($('.checkbox_tag:checked').length > 0) {
		$('#filter_form').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a>');
		$('#clear_filters').on('click', function() {
			$('.checkbox_tag:checked').removeAttr('checked');
			$('#filter_form').submit();
		});
	}
	
});

