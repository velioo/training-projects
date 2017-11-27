$(document).ready(function() {
	
	infoLog += '\ndelete_product_tag.js loaded\n';
	
	var deleteProductTagUrl = getDeleteProductTagUrl();

	$(document).on('click','.remove_tag',function(e){
		e.preventDefault();
		infoLog += '\ndelete_product_tag.js/.remove_tag: Executing... \n';
		var productId = parseInt($(this).data('product-id'), 10);
		if(productId === parseInt(productId, 10)) {
			assert(productId === parseInt(productId, 10));
			var tagName = $(this).prev().val();
			var self = $(this);
			infoLog += 'delete_product_tag.js/.remove_tag: Sending request to ' + deleteProductTagUrl + 
					   ' with params: productId = ' + productId + ', tagName = ' + tagName + '\n';
			$.post(deleteProductTagUrl , {productId: productId, tagName: tagName}, function(data){
				if(data) {
					infoLog += 'delete_product_tag.js/.remove_tag: Request successfull\n';
					self.parent().remove();
				} else {
					infoLog += 'delete_product_tag.js/.remove_tag: Request failed\n';
					window.alert('error removing tag');
				}					
				logger.info(infoLog);
				infoLog = "";	
			});
		} else {
			infoLog += 'delete_product_tag.js/.remove_tag: productId must be integer\n';
			logger.info(infoLog);
			infoLog = "";		
		}
	});
	
});
