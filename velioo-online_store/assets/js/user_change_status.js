$(document).ready(function() {
	
  var declineOrderUrl = getDeclineOrderUrl();
  var confirmOrderUrl = getConfirmOrderUrl();
	
  $(".cancel_order").click(function(){
	if (confirm('Сигурни ли сте, че искате да откажете поръчката.')) {
		var order_id = $(this).parent().parent().data("id");
		var self = $(this);
		$.post(declineOrderUrl , {orderId: order_id}, function(data){
			if(data) {
				self.parent().parent().find('.order_status').text("Canceled");
				if($('.confirm_order').length > 0) {
					$('.confirm_order').remove();
				}
				self.remove();
			} else {
				window.alert("Възникна проблем, моля свържете се с вашия администратор.");
			}			
		});
	} 
  });  
  
  $(".confirm_order").click(function(){
	if (confirm('Сигурни ли сте, че искате да означите поръчката като доставена.')) {
		var order_id = $(this).parent().parent().data("id");
		var self = $(this);
		$.post(confirmOrderUrl , {orderId: order_id}, function(data){
			if(data) {
				self.parent().parent().find('.order_status').text("Delivered");
				if($('.cancel_order').length > 0) {
					$('.cancel_order').remove();
				}
				self.remove();
			} else {
				window.alert("Възникна проблем, моля свържете се с вашия администратор.");
			}			
		});
	} 
  });  
	
});
