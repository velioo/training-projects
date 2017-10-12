$(document).ready(function() {
	
	var deleteProductTagUrl = getDeleteProductTagUrl();

	$(document).on('click','.remove_tag',function(){
		
		var productId = $(this).data('product-id');
		var tagName = $(this).prev().val();
		var self = $(this);
		
		$.post(deleteProductTagUrl , {productId: productId, tagName: tagName}, function(data){
			if(data) {
				self.parent().remove();
			} else {
				window.alert('error removing tag');
			}			
		});
		
	});
	
});
