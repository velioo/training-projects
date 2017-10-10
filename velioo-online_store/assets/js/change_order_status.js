$(document).ready(function() {
	
	var changeStatusUrl = getChangeStatusUrl();

	
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
});
