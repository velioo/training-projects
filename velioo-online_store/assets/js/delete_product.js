$(document).ready(function() {
   
  infoLog += '\ndelete_product.js loaded\n';
   
  var deleteUrl = getDeleteUrl(); 
   
  $("#products_table").on('click', '.delete_record', function(e){
	infoLog += '\ndelete_product.js/#products_table: Executing... \n';
	e.preventDefault();
	if (confirm('Are you sure you want to delete this record ?')) {
		var productId = parseInt($(this).data("id"), 10);
		var parent_element = $(this).parent().parent();
		if(productId === parseInt(productId, 10)) {
			assert(productId === parseInt(productId, 10));
			infoLog += 'delete_product.js/#products_table: Sending request to ' + deleteUrl + ' with params: productId = ' + productId + '\n';
			$.post(deleteUrl, {productId: productId} , function(data){
				if(data) {
					infoLog += '\ndelete_product.js/#products_table: Request successfull\n';
					//window.alert("Продуктът е успешно премахнат.");			
					parent_element.remove();
				} else {
					infoLog += '\ndelete_product.js/#products_table: Request failed\n';
					window.alert("Възникна проблем, моля свържете се с вашия администратор.");
				}	
				logger.info(infoLog);
				infoLog = "";		
			});
		} else {
			infoLog += '\ndelete_product.js/#products_table: productId must be integer\n';
			logger.info(infoLog);
			infoLog = "";	
		}
	} 
  });  
});
