$(document).ready(function() {
	
	var deleteTagUrl = getDeleteTagUrl();

	$(document).on('click','.remove_tag',function(){
		
		var productId = $(this).data('product-id');
		var tagName = $(this).prev().val();
		var self = $(this);
		
		$.post(deleteTagUrl , {productId: productId, tagName: tagName}, function(data){
			if(data) {
				self.prev().remove();
				self.remove();
			} else {
				window.alert('error removing tag');
			}			
		});
		
	});
	
});
