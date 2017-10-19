$(document).ready(function() {
	
	var changeStatusUrl = getChangeStatusUrl();
	
	$('#orders_table').on('change', '.select_status', function() {
		var statusId = $(this).val();
		var orderId = $(this).parent().parent().children('td').eq(2).text();
		$.post(changeStatusUrl, {orderId: orderId, statusId: statusId}, function(data, status) {
			if(data) {
				//notification(orderId);
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
