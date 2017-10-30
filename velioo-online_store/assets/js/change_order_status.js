$(document).ready(function() {
	
	infoLog += '\nchange_order_status.js loaded';
	
	var changeStatusUrl = getChangeStatusUrl();
	
	$('#orders_table').on('change', '.select_status', function() {
		infoLog += '\nchange_order_status.js/#orders_table: Executing... \n';
		var statusId = parseInt($(this).val(), 10);
		var orderId = parseInt($(this).parent().parent().children('td').eq(2).text(), 10);
		if(statusId === parseInt(statusId, 10) && orderId === parseInt(orderId, 10)) {
			
			assert((statusId === parseInt(statusId, 10)) && (orderId === parseInt(orderId, 10)));
			
			infoLog += 'change_order_status.js/#orders_table: Sending request to ' + changeStatusUrl + ' with params: orderId = ' + orderId + ', statusId = ' + statusId + '\n';
			$.post(changeStatusUrl, {orderId: orderId, statusId: statusId}, function(data, status) {
				if(data) {
					infoLog += '\nchange_order_status.js/#orders_table: Request successfull\n';
					//notification(orderId);
				} else {
					infoLog += '\nchange_order_status.js/#orders_table: Request failed\n';
					window.alert("Възникна проблем при обработката на заявката ви.");
				}
				logger.info(infoLog);
				infoLog = "";
			});
	    } else {
			infoLog += "change_order_status.js/#orders_table: statusId or/and orderId must be integers: statusId = " + statusId + ', orderId = ' + orderId + '\n';
			logger.info(infoLog);
			infoLog = "";
		}
	});	
	
	//~ function notification(orderId) {
	  //~ $('#message').prepend("<p>Поръчка# " + orderId + " е успешно променена.</p>");
	  //~ setTimeout(function(){
		//~ $('#message p:last').fadeOut('slow',function(){
			//~ $(this).remove();
		//~ });
	  //~ }, 2000);
	//~ }
	
});
