$(document).ready(function() {
	
  infoLog += '\nuser_change_status.js loaded\n';	
	
  var declineOrderUrl = getDeclineOrderUrl();
  var confirmOrderUrl = getConfirmOrderUrl();
	
  $(".cancel_order").click(function() {
	infoLog += '\nuser_change_status.js/.cancel_order: Executing...\n';
	if (confirm('Сигурни ли сте, че искате да откажете поръчката.')) {
		var orderId = parseInt($(this).parent().parent().data("id"), 10);
		var self = $(this);
		if(orderId === parseInt(orderId, 10)) {
			infoLog += 'user_change_status.js/.cancel_order: Order id = ' + orderId + '\n';
			assert(orderId === parseInt(orderId, 10), 'user_change_status.js/.cancel_order:\nAssert Error: orderId must be integer');
			infoLog += 'user_change_status.js/.cancel_order: Sending request to ' + declineOrderUrl + ' with params: orderId = ' + orderId + '\n';
			$.post(declineOrderUrl , {orderId: orderId}, function(data){
				if(data) {
					infoLog += 'user_change_status.js/.cancel_order: Request successfull\n';
					self.parent().parent().find('.order_status').text("Canceled");
					if($('.confirm_order').length > 0) {
						$('.confirm_order').remove();
					}
					self.remove();
				} else {
					infoLog += 'user_change_status.js/.cancel_order: Request failed\n';
					window.alert("Възникна проблем, моля свържете се с вашия администратор.");
				}	
				logger.info(infoLog);
				infoLog = "";		
			});
		} else {
			infoLog += 'user_change_status.js/.cancel_order: Order id is not integer: ' + orderId + '\n';
			logger.info(infoLog);
			infoLog = "";
			window.alert("Имаше проблем в обработването на заявката ви.");
		}
	} 
  });  
  
  $(".confirm_order").click(function() {
	infoLog += '\nuser_change_status.js/.confirm_order: Executing...\n';
	if (confirm('Сигурни ли сте, че искате да означите поръчката като доставена.')) {
		var orderId = parseInt($(this).parent().parent().data("id"), 10);
		var self = $(this);
		if(orderId === parseInt(orderId, 10)) {
			infoLog += 'user_change_status.js/.confirm_order: Order id = ' + orderId + '\n';
			assert(orderId === parseInt(orderId, 10), 'user_change_status.js/.confirm_order:\nAssert Error: orderId must be integer');
			infoLog += 'user_change_status.js/.confirm_order: Sending request to ' + confirmOrderUrl + ' with params: orderId = ' + orderId + '\n';
			$.post(confirmOrderUrl , {orderId: orderId}, function(data){
				if(data) {
					infoLog += 'user_change_status.js/.confirm_order: Request successfull\n';
					self.parent().parent().find('.order_status').text("Delivered");
					if($('.cancel_order').length > 0) {
						$('.cancel_order').remove();
					}
					self.remove();
				} else {
					infoLog += 'user_change_status.js/.confirm_order: Request failed\n';
					window.alert("Възникна проблем, моля свържете се с вашия администратор.");
				}		
				logger.info(infoLog);
				infoLog = "";	
			});
	    } else {
			infoLog += 'user_change_status.js/.confirm_order: Order id is not integer: ' + orderId + '\n';
			logger.info(infoLog);
			infoLog = "";
			window.alert("Имаше проблем в обработването на заявката ви.");
		}
	} 
  });  
	
});
