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
			}).
			fail(function(xmlObject, status, errorThrown) {
				if(status == 'parsererror') {
					infoLog += 'main_menu.js: Error parsing JSON data\n' + errorThrown;
					window.alert("Failed to get data from server. Please try again later");
				} else if(status == 'timeout') {
					infoLog += 'main_menu.js: Request timed out\n';
					window.alert("Request timed out");
				} else if(status == 'error') {
					infoLog += 'main_menu.js: An error occurred\n';
					window.alert("Failed to get data from server. Please try again later");
				} else if(status == 'abort') {
					infoLog += 'main_menu.js: Internet connection lost\n';
					window.alert("Check your internet connection and try again.");
				} else {
					infoLog += 'main_menu.js: Unknown error occurred\n';
					window.alert("Failed to get data from server. Please try again later");
				}
				infoLog += 'main_menu.js:\n Response Text:' + xmlObject.responseText + 
												 '\n Ready State:' + xmlObject.readyState + 
												 '\n Status Code: ' + xmlObject.status;
				logger.info(infoLog);
				infoLog = "";
				$('.spinner.menu').hide();
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
