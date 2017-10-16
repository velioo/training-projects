$(document).ready(function() {
	
	var changeStatusUrl = getChangeStatusUrl();
	var emailsUrl = getEmailsUrl();
	
	$('.select_status').on('change', function() {
		var statusId = $(this).val();
		var orderId = $(this).parent().parent().data('id');
		$.post(changeStatusUrl, {orderId: orderId, statusId: statusId}, function(data, status) {
			if(data) {
				notification(orderId);
			} else {
				window.alert("Възникна проблем при обработката на заявката ви.");
			}
		});
		
	});	
	
	function notification(orderId) {
	  $('#message').prepend("<p>Поръчка# " + orderId + " е успешно променена.</p>");
	  setTimeout(function(){
		$('#message p:last').fadeOut('slow',function(){
			$(this).remove();
		});
	  }, 2000);
	}
	
	$(function() {
		$( ".data_picker" ).datepicker({
			dateFormat : 'yy-mm-dd',
			changeMonth : true,
			changeYear : true
		});
	});
	
	var options = {
		url: function(phrase) {
			return emailsUrl + "/" + phrase;
		},
		dataType: "json",
		getValue: "email"
	};

	$("#email_search_input").easyAutocomplete(options);
	
	if($('.filter').val() || $('#email_search_input').val()) {
		$('#filter_form').prepend('<a href="#" style="color:red;" id="clear_filters">Изчисти филтрите</a></br></br>');
		$('#clear_filters').on('click', function() {
			$('.filter').val('');
			$('#filter_form').submit();
		});
	}
	
});
